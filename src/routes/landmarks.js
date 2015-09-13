import landmarks from '../data';
import { weatherWorker, flickrWorker, instagramWorker } from '../workers';

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

    compose(landmark, query.forecast, query.num_photos)
    .then((composed) => res.json(composed));
  }
};

function compose(landmark, forecast, numPhotos) {
  var promises = [];

  promises.push(weatherWorker.getWeather(landmark.lat, landmark.long, forecast)
  .then((weather) => weather));

  promises.push(flickrWorker.getPhotos(landmark, numPhotos)
  .then((photos) => photos));

  promises.push(instagramWorker.getPhotos(landmark, numPhotos)
  .then((photos) => photos));

  return q.spread(promises, (weather, flickrPhotos, igPhotos) => {
    let photos = [].concat(flickrPhotos).concat(igPhotos);

    // show only the latest photo from all the aggregated sources
    if(!numPhotos) {
      photos.sort((a, b) => (new Date(b.date_taken).getTime() - new Date(a.date_taken).getTime()));
      photos.length = 1;
    }

    let composedLandmark = _.extend(landmark, {
      weather: weather,
      photos: photos
    });

    return _.omit(composedLandmark, 'flickr_query', 'ig_tags');
  });
}
