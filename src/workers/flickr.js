import config from '../config-local.js';
import _ from 'lodash';

let Flickr = require('flickrapi');

let flickrOptions = {
  api_key: config.flickr_api_key,
  secret: config.flickr_api_secret
};

export default {
  getPhotos(landmark, num) {
    let searchOptions;
    let numPhotos;

    if(+num) {
      if(num > 50) {
        numPhotos = 50;
      } else {
        numPhotos = num;
      }
    } else {
      numPhotos = 5;
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

    return new Promise((resolve, reject) => {
      Flickr.tokenOnly(flickrOptions, function(error, flickr) {
        let promises = []
        .concat(new Promise((resolve, reject) => {
          var byLocationGenerator = (function *(l) {
            let byLocation = yield request.call(byLocationGenerator, flickr, 'search', searchOptions);

            let photoPromises = byLocation.photos.photo.map(photo => {
              return request(flickr, 'getInfo', { photo_id: photo.id });
            });

            Promise.all(photoPromises).then(photos => {
              resolve(photos.map(composePhotos));
            }, function() {
              console.log('error');
            });
          })(landmark);

          byLocationGenerator.next();
        }));

        resolve(Promise.all(promises).then(values => _.flatten(values)));
      });
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
      if(typeof this !== 'undefined' && 'next' in this) this.next(res);
    });
  });
}
