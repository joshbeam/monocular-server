import _ from 'lodash';
import landmarks from '../data';
import { weatherWorker, flickrWorker, instagramWorker, pxWorker } from '../workers';
import redis from 'redis';

export default {
  all(req, res) {
    let numPhotos = resolveNumPhotos(req.query.num_photos);

    Promise.all(landmarks.map((landmark) => {
      return compose(landmark, undefined, numPhotos);
    }))
    .then((composed) => res.json(composed));
  },

  one(req, res) {
    var name = req.params.name;
    var landmarkNames = landmarks.map((l) => l.name);
    var query = req.query;
    var numPhotos = resolveNumPhotos(query.num_photos);
    var landmark;

    if(landmarkNames.indexOf(name) === -1) {
      res.sendStatus(404);
    }

    landmark = landmarks.filter((l) => l.name === name)[0];

    compose(landmark, query.forecast, numPhotos).then(composed => res.json(composed));
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
  .concat(instagramWorker.getPhotos(landmark, numPhotos).then(photos => photos))
  .concat(pxWorker.getPhotos(landmark, numPhotos).then(photos => photos));

  return Promise.all(promises).then(promises => {
    let [weather, flickrPhotos, igPhotos, pxPhotos] = promises;

    let photos = []
    .concat(flickrPhotos)
    .concat(igPhotos)
    .concat(pxPhotos)
    .filter(photo => +photo.date_taken < (new Date().getTime()))
    .sort((a, b) => (new Date(b.date_taken).getTime() - new Date(a.date_taken).getTime()))
    .slice(0, numPhotos);

    let composedLandmark = _.extend(landmark, {
      weather: weather,
      photos: photos
    });

    return _.omit(composedLandmark, 'flickr_query', 'ig_tags');
  });
}

function resolveNumPhotos(num) {
  if(_.inRange(+num, 0, 50)) {
    return +num;
  } else {
    return isNaN(+num) ? 5 : 50;
  }
}
