require('babel/polyfill');

import config from '../config-local.js';
import _ from 'lodash';
import co from 'co';
import instagram from 'instagram-node';

const ig = instagram.instagram();

ig.use({ client_id: config.ig_api_client_id, client_secret: config.ig_api_client_secret });

export default {
  /**
   *  @param landmark {PlainObject}
   *  @param num {Number|String} optional
   *  @returns {Promise}
   */
  getPhotos(landmark, num) {
    let numPhotos;

    if(_.inRange(+num, 0, 50)) {
      numPhotos = +num;
    } else {
      numPhotos = isNaN(+num) ? 5 : 50;
    }

    return co(function* () {
      let results = yield [
        request('media_search', +landmark.lat, +landmark.long),
        request('tag_media_recent', landmark.ig_tags[0])
      ];

     return _.uniq(_.flatten(results).map(composePhotos)).slice(0, numPhotos);
    });
  }

};

/**
 *  Calls the instagram API
 *
 *  @param method {String} one of the allowed instagram API methods
 *  @param ...query {PlainObject|String} appropriate instagram API query params
 *  @returns {Promise}
 */

function request(method, ...query) {
  return new Promise((resolve, reject) => {
    ig[method](...query, (err, res, rem, lim) => {
      resolve(res);
    });
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
