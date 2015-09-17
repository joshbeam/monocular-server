import config from '../config-local.js';
import _ from 'lodash';
import co from 'co';
import Flickr from 'flickrapi';

let flickrOptions = {
  api_key: config.flickr_api_key,
  secret: config.flickr_api_secret
};

// REVIEW: should we limit the number of photos per query to numPhotos/queries.length ?
class Query {
  constructor(landmark, numPhotos) {
    this.text = landmark.flickr_query;
    this.safe_search = 1;
    this.per_page = numPhotos;
    this.page = 1;
  }

  set(query) {
    Object.assign(this, query);

    return this;
  }
}

export default {
  getPhotos(landmark, numPhotos) {
    let queries;

    // REVIEW: Should we do 3 queries instead? only lat/long, only flickr_query, and then combined?
    queries = [
      new Query(landmark, numPhotos),
      new Query(landmark, numPhotos).set({
        lat: landmark.lat,
        lon: landmark.long,
        radius: 0.25,
        radius_units: 'mi',
        sort: 'date-posted-desc'
      }),
      new Query(landmark, numPhotos).set({ tags: landmark.flickr_tags })
    ];

    return co(function *() {
      // we can't start until we have our flickr object
      let flickr = yield new Promise((resolve, reject) => {
        Flickr.tokenOnly(flickrOptions, (err, f) => resolve(f));
      });

      let results = yield queries.map(query => {
        return co(function *() {
          let data = yield request(flickr, 'search', query);

          return yield data.photos.photo.map(photo => request(flickr, 'getInfo', { photo_id: photo.id }));

        }).catch(logError);
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

function logError(err) {
  return Promise.resolve(console.warn('Error:', err.error, 'For query:', err.query));
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
