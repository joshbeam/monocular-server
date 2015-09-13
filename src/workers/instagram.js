import config from '../config-local.js';
var request = require('request');

export default {

  getPhotos(landmark, num) {
    let url = 'https://api.instagram.com/v1/tags/' + landmark.ig_tags[0] + '/media/recent?client_id=' + config.ig_api_client_id;
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

    return new Promise((resolve, reject) => {
      request(url, (err, res, body) => {
        if(err) {
          reject(err);
        } else {
          let photos = (JSON.parse(body)).data;

          photos.length = numPhotos;

          resolve(photos.map((photo) => {
            return {
              date_taken: new Date(+photo.created_time * 1000),
              src: photo.images.standard_resolution.url,
              url: photo.link
            };
          }));
        }
      });
    });

  }

};
