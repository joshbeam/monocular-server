import _ from 'lodash';
import co from 'co';
import { Client, Operations } from '../util';

export default {
  one(req, res) {
    let numPhotos = resolveNumPhotos(req.query.num_photos);

    co(function*() {
      const landmark = yield Operations.getLandmarks()
      .then(results => {
        const landmarks = new Set( results.map(result => result.name) );
        const name = req.params.name;

        if(!landmarks.has(name)) {
          throw { statusCode: 404 };
        }

        let id = results.filter(result => result.name === name)[0].id;

        return {
          mediaKey: ['landmarks', id, 'media'].join(':'),
          data: results.filter(result => result.id === id)[0]
        };
      });

      const media = yield Operations.getMedia(landmark.mediaKey, numPhotos);

      return compose(landmark.data, media);
    })
    .then(landmark => {
      return res.json(landmark);
    })
    .catch(sendError);
  },

  all(req, res) {
    let numPhotos = resolveNumPhotos(req.query.num_photos);

    co(function*() {
      const landmarks = yield Operations.getLandmarks();

      const composed = yield landmarks.map(landmark => {
        let key = ['landmarks', landmark.id, 'media'].join(':');

        return Operations.getMedia(key, numPhotos)
        .then(media => {
          return compose(landmark, media);
        });
      });

      return composed;
    })
    .then(landmarks => {
      res.json(landmarks);
    })
    .catch(sendError);
  }
};

function sendError(err) {
  console.log('Error:', err);

  if(statusCode in err) {
    res.sendStatus(statusCode);
  } else {
    res.sendStatus(500);
  }
}

function resolveNumPhotos(num) {
  return isNaN(+num) ? 5 : +num;
}

function compose(landmark, media) {
  return _.omit(Object.assign(landmark, { photos: media }), 'id', 'tags', 'media');
}
