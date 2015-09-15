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
        // query for coordinates
        request('media_search', +landmark.lat, +landmark.long),
        // query for all of the tags
        co(function* () {
          return yield landmark.ig_tags.map(tag => {
            return request('tag_media_recent', tag);
          });
        })
      ];

      /**
       *  Our results is a bunch of (potentially) deeply nested arrays.
       *  Functionally, below will turn [[],[],[[],[],[[]]]] into [...],
       *  remove duplicates (because some of the queries may have
       *  identical items), and compose usable "photo" objects. Lastly, we'll
       *  trim off excess items, limiting the array to numPhotos.
       */
      return _.uniq(_.flatten(results, true).map(composePhotos)).slice(0, numPhotos);
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
