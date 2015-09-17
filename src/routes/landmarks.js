import _ from 'lodash';
import landmarks from '../data';
import { weatherWorker, flickrWorker, instagramWorker, pxWorker } from '../workers';

export default {
  all(req, res) {
    Promise.all(landmarks.map((landmark) => {
      return compose(landmark, undefined, 5);
    }))
    .then((composed) => res.json(composed));
  },

  one(req, res) {
    var name = req.params.name;
    var landmarkNames = landmarks.map((l) => l.name);
    var query = req.query;
    var numPhotos;
    var landmark;

    if(_.inRange(+query.num_photos, 0, 50)) {
      numPhotos = +query.num_photos;
    } else {
      numPhotos = isNaN(+query.num_photos) ? 5 : 50;
    }

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
