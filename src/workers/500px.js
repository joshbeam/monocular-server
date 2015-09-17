import config from '../config-local.js';
import _ from 'lodash';
import co from 'co';
import px from '500px';

const api = new px(config.px_api_consumer_key);

export default {
  getPhotos(landmark, numPhotos) {
    return co(function *() {
      let location = (''+landmark.lat + ','+landmark.long + ',0.25mi');

      let results = yield [
        request('searchByGeo', location, {sort: 'created_at', sort_direction: 'desc', rpp: ''+numPhotos, image_size: 440})
      ];

      return results.reduce((a, c) => a.concat(c.photos), []).map(composePhotos);
    });

  }
};

function composePhotos(media) {
  return {
    src: media.image_url,
    url: media.url,
    date_taken: new Date(media.taken_at).getTime()
  };
}

function logError(err) {
  return Promise.resolve(console.warn('Error:', err.error, 'For query:', err.query));
}

function request(method, ...query) {
  return new Promise((resolve, reject) => {
    api.photos[method](...query,  function(err, res) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}
