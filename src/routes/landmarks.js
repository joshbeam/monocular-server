import landmarks from '../data';
import { weatherWorker } from '../workers';

var q = require('q');

export default {
  all(req, res) {
    res.json(landmarks);
  },

  one(req, res) {
    var name = req.params.name;
    var landmarkNames = landmarks.map((l) => l.name);
    var promises = [];
    var query = req.query;
    var landmark;

    if(landmarkNames.indexOf(name) === -1) {
      res.sendStatus(404);
    }

    landmark = landmarks.filter((l) => l.name === name)[0];

    promises.push(weatherWorker.getWeather(landmark.lat, landmark.long, req.query.forecast)
    .then(function(weather) {
      return weather;
    }));

    q.spread(promises, function(weather) {
      var landmarkInfo = {
        weather: weather
      };

      res.json(landmarkInfo);
    });
  }
};
