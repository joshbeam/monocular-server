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
    searchOptions = [
      {
        text: landmark.flickr_query,
        safe_search: 1,
        per_page: numPhotos,
        page: 1
      },
      {
        text: landmark.flickr_query,
        safe_search: 1,
        lat: landmark.lat,
        lon: landmark.lon,
        radius: 2,
        sort: 'date-posted-desc',
        per_page: numPhotos,
        page: 1
      }
      // do a tag query too
    ];

    return co(function *() {
      // we can't start until we have our flickr object
      let flickr = yield new Promise((resolve, reject) => {
        Flickr.tokenOnly(flickrOptions, (err, f) => resolve(f));
      });

      let results = yield searchOptions.map(options => {
        return co(function *() {
          let data = yield request(flickr, 'search', options);

          return yield data.photos.photo.map(photo => request(flickr, 'getInfo', { photo_id: photo.id }));

        }).catch(err => {

          return Promise.resolve(console.warn('Error:', err.error, 'For query:', err.query));

        });
      });

      return _.uniq(_.flatten(results.filter(result => result !== undefined), true), 'photo.id').map(composePhotos);
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
      if(err) {
        reject({ error: err, query: [...query] });
      } else {
        resolve(res);
      }
    });
  });
}
