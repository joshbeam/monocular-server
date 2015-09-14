'use strict';
require('babel/polyfill');

import config from '../config-local.js';
import _ from 'lodash';
var ig = require('instagram-node').instagram();

ig.use({ client_id: config.ig_api_client_id, client_secret: config.ig_api_client_secret });

export default {
  // TODO: query for tags, and then query for locations
  getPhotos(landmark, num) {
    let promises = [];
    let numPhotos;

    if(!!(+num)) {
      if(num > 50) {
        numPhotos = 50;
      } else {
        numPhotos = num;
      }
    } else {
      numPhotos = 5;
    }

    promises.push(new Promise((resolve, reject) => {
      var byLocationGenerator = (function *(l) {
        let byLocation = yield request.call(byLocationGenerator, 'media_search', +l.lat, +l.long);

        console.log('byLocatioj', byLocation.length);

        resolve(byLocation.map(composePhotos));
      })(landmark);

      byLocationGenerator.next();
    }))


    promises.push(new Promise((resolve, reject) => {
      var byTagGenerator = (function *(t) {
        let byTag = yield request.call(byTagGenerator, 'tag_media_recent', landmark.ig_tags[0]);

        console.log('byTag', byTag.length);

        resolve(byTag.map(composePhotos));
      })(landmark);

      byTagGenerator.next();
    }));

    return Promise.all(promises).then(igPhotos => _.flatten(igPhotos).slice(0, numPhotos));
  }

};

function request(method, ...query) {
  ig[method](...query, (err, res, rem, lim) => {
    this.next(res);
  });
}

function composePhotos(media) {
  return {
    date_taken: new Date(+media.created_time * 1000).getTime(),
    src: media.images.standard_resolution.url,
    url: media.link
  }
}
