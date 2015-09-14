'use strict';

import config from '../config-local.js';
import _ from 'lodash';
var request = require('request');
var ig = require('instagram-node').instagram();

ig.use({ client_id: config.ig_api_client_id, client_secret: config.ig_api_client_secret });

export default {

  // TODO: query for tags, and then query for locations
  getPhotos(landmark, num) {
    let tagRoute = 'https://api.instagram.com/v1/tags/';
    let clientIdRoute = '/media/recent?client_id=' + config.ig_api_client_id;
    let numPhotos;

    // ig.tag_search('query', function(err, result, remaining, limit) {
    //   console.log(err, result);
    // });

    // new Promise((resolve, reject) => {
    //   ig.location_search({ lat: +landmark.lat, lng: +landmark.long }, (err, res, rem, lim) => {
    //     if(err) {
    //       reject(err);
    //     } else {
    //       resolve(res.map(p => p.id));
    //     }
    //   });
    // })
    // .then((ids) => {
    //   let mediaPromises = ids.map((id) => {
    //     return new Promise((resolve, reject) => {
    //       ig.media(id, (err, media, remaining, limit) => {
    //         if(err) {
    //           reject(err);
    //         } else {
    //           console.log(media);
    //           resolve(media.data);
    //         }
    //       });
    //     });
    //   });
    // });

    let resources = landmark.ig_tags.map((tag) => {
      return tagRoute + tag + clientIdRoute;
    });

    if(+num) {
      if(num > 50) {
        numPhotos = 50;
      } else {
        numPhotos = num;
      }
    } else {
      numPhotos = 5;
    }

    let promises = resources.map((resource) => {
      return new Promise((resolve, reject) => {
        request(resource, (err, res, body) => {
          if(err) {
            reject(err);
          } else {
            let photos = (JSON.parse(body)).data;

            photos.sort((a, b) => (new Date(+b.created_time * 1000) - new Date(+a.created_time * 1000)));

            resolve(photos.map((photo) => {
              return {
                date_taken: new Date(+photo.created_time * 1000).getTime(),
                src: photo.images.standard_resolution.url,
                url: photo.link
              };
            }));
          }
        });
      });
    });

    return Promise.all(promises)
    .then((promises) => {
      // [[photos for tag], [photos for tag]] => [all photos for all tags]
      return _.flatten(promises, true).slice(0, numPhotos);
    });

  }

};
