import landmarks from '../data';
import { weatherWorker } from '../workers';

var q = require('q');
var _ = require('lodash');

export default {
  all(req, res) {
    q.all(landmarks.map((landmark) => {
      return compose(landmark);
    }))
    .then((composed) => res.json(composed));
  },

  one(req, res) {
    var name = req.params.name;
    var landmarkNames = landmarks.map((l) => l.name);
    var query = req.query;
    var landmark;

    if(landmarkNames.indexOf(name) === -1) {
      res.sendStatus(404);
    }

    landmark = landmarks.filter((l) => l.name === name)[0];

    compose(landmark, query.forecast)
    .then((composed) => res.json(composed));
  }
};

function compose(landmark, forecast) {
  return weatherWorker.getWeather(landmark.lat, landmark.long, forecast)
  .then((weather) => _.extend(landmark, { weather: weather }));
}
