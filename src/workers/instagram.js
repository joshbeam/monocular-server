'use strict';
require('babel/polyfill');

import config from '../config-local.js';
import _ from 'lodash';
var ig = require('instagram-node').instagram();

ig.use({ client_id: config.ig_api_client_id, client_secret: config.ig_api_client_secret });

export default {
  /**
   *  @param landmark {PlainObject}
   *  @param num {Number|String}
   */
  getPhotos(landmark, num) {
    let promises = []
    .concat(new Promise((resolve, reject) => {
      // query for photos by location
      var byLocationGenerator = (function *(l) {
        let byLocation = yield request.call(byLocationGenerator, 'media_search', +l.lat, +l.long);

        resolve(byLocation.map(composePhotos));
      })(landmark);

      byLocationGenerator.next();
    }))
    .concat(new Promise((resolve, reject) => {
      // query for photos by tag
      var byTagGenerator = (function *(t) {
        let byTag = yield request.call(byTagGenerator, 'tag_media_recent', landmark.ig_tags[0]);

        resolve(byTag.map(composePhotos));
      })(landmark);

      byTagGenerator.next();
    }));
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

    return Promise.all(promises).then(igPhotos => {
      // [[...], [...]] => [......]
      let flat = _.flatten(igPhotos);
      // the two separate queries could return some duplicate objects
      let unique = _.uniq(flat);

      return unique.slice(0, numPhotos)
    });
  }

};

/**
 *  Calls the instagram API and then invokes its generator's #next method
 *
 *  @param method {String} one of the allowed instagram API methods
 *  @param ...query {PlainObject|String} appropriate instagram API query params
 */
function request(method, ...query) {
  ig[method](...query, (err, res, rem, lim) => {
    this.next(res);
  });
}

/**
 *  Generates a composed photo object for the client to consume.
 *
 *  @param media {PlainObject}
 *  @returns {PlainObject}
 */
function composePhotos(media) {
  return {
    date_taken: new Date(+media.created_time * 1000).getTime(),
    src: media.images.standard_resolution.url,
    url: media.link
  }
}
