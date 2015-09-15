import landmarks from '../data';
import { weatherWorker, flickrWorker, instagramWorker } from '../workers';

var q = require('q');
var _ = require('lodash');

export default {
  all(req, res) {
    Promise.all(landmarks.map((landmark) => {
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

    compose(landmark, query.forecast, query.num_photos).then(composed => res.json(composed));
  }
};

/**
 *  Calls the various workers and composes the results into a complete object representing
 *  the landmark.
 *
 *  @param landmark {PlainObject}
 *  @param forecast {String}
 *  @param numPhotos {Number|String}
 *  @returns {Promise}
 */
function compose(landmark, forecast, numPhotos) {
  var promises = []
  .concat(weatherWorker.getWeather(landmark.lat, landmark.long, forecast).then(weather => weather))
  .concat(flickrWorker.getPhotos(landmark, numPhotos).then(photos => photos))
  .concat(instagramWorker.getPhotos(landmark, numPhotos).then(photos => photos));

  return q.spread(promises, (weather, flickrPhotos, igPhotos) => {
    let photos = []
    .concat(flickrPhotos)
    .concat(igPhotos)
    .filter(photo => +photo.date_taken < (new Date().getTime()))
    .sort((a, b) => (new Date(b.date_taken).getTime() - new Date(a.date_taken).getTime()));

    let composedLandmark = _.extend(landmark, {
      weather: weather,
      photos: photos
    });

    return _.omit(composedLandmark, 'flickr_query', 'ig_tags');
  });
}
