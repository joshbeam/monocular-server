import config from '../config-local.js';
import _ from 'lodash';
import co from 'co';
import Flickr from 'flickrapi';

let flickrOptions = {
  api_key: config.flickr_api_key,
  secret: config.flickr_api_secret
};

export default {
  getPhotos(landmark, num) {
    let searchOptions;
    let numPhotos;

    if(_.inRange(+num, 0, 50)) {
      numPhotos = +num;
    } else {
      numPhotos = isNaN(+num) ? 5 : 50;
    }

    // REVIEW: Should we do 3 queries instead? only lat/long, only flickr_query, and then combined?
    searchOptions = {
      text: landmark.flickr_query,
      safe_search: 1,
      content_type: 1,
      lat: landmark.lat,
      lon: landmark.lon,
      per_page: numPhotos,
      page: 1
    };

    return co(function *() {
      // we can't start until we have our flickr object
      let flickr = yield new Promise((resolve, reject) => {
        Flickr.tokenOnly(flickrOptions, (err, f) => resolve(f));
      });

      // array of query promises
      let results = yield [
        co(function *() {
          let data = yield request(flickr, 'search', searchOptions);

          return yield data.photos.photo.map(photo => request(flickr, 'getInfo', { photo_id: photo.id }));
        })
      ];

      return _.flatten(results).map(composePhotos);
    });

  }
};

function composePhotos(photo) {
  let data = photo.photo;

  return {
    src: ['https://farm', data.farm, '.staticflickr.com/', data.server, '/', data.id, '_', data.secret, '.jpg'].join(''),
    url: data.urls.url[0]._content,
    date_taken: new Date(data.dates.taken).getTime()
  };
}

function request(f, method, ...query) {
  return new Promise((resolve, reject) => {
    f.photos[method](...query, (err, res) => {
      resolve(res);
    });
  });
}
