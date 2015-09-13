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
      return weather.body;
    }));

    q.spread(promises, function(weather) {
      var landmarkInfo = {
        weather: formattedWeather(JSON.parse(weather), req.query.forecast)
      };

      res.json(landmarkInfo);
    });
  }
};

function formattedWeather(raw, forecast) {
  if(forecast) {
    return raw;
  } else {
    return {
      temp: raw.main.temp,
      temp_min: raw.main.temp_min,
      temp_max: raw.main.temp_max,
      main: raw.weather[0].main
    };
  }
}
