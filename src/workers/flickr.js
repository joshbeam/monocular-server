import config from '../config-local.js';

let Flickr = require("flickrapi");

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
      numPhotos = 1;
    }

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
        flickr.photos.search(searchOptions, (err, res) => {
          if(err) {
            reject(err);
          } else {
            let promises = res.photos.photo.map((photo) => {

              return new Promise((resolve, reject) => {
                flickr.photos.getInfo({
                  photo_id: photo.id
                }, (err, res) => {
                  if(err) {
                    reject(err);
                  } else {
                    resolve(res);
                  }
                });
              });

            });

            return Promise.all(promises)
            .then((photos) => {
              var composedPhotos = photos.map((photo) => {
                var data = photo.photo;

                return {
                  url: ['https://farm', data.farm, '.staticflickr.com/', data.server, '/', data.id, '_', data.secret, '.jpg'].join('')
                };
              });

              resolve(composedPhotos);
            });
          }

        });
      });
    });

  }
};
