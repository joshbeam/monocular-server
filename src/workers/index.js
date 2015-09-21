import _ from 'lodash';
import config from '../config-local.js';
import redis from 'redis';
import co from 'co';
import { Operations } from '../util'
import weatherWorker from './weather.js';
import flickrWorker from './flickr.js';
import instagramWorker from './instagram.js';
import pxWorker from './500px';

const client = redis.createClient(config.redislabs.port, config.redislabs.host, {
  auth_pass: config.redislabs.password
});

export default {
  scrape() {
    console.log('Started scraping...');

    co(function*() {
      const landmarks = yield Operations.getLandmarks();

      landmarks.forEach(landmark => {
        let id = landmark.id;

        instagramWorker.getPhotos(landmark, 5)
        .then(media => {
          let promises = media.map(medium => {

            return new Promise((resolve, reject) => {
              client.incr('next_media_id', (err, res) => {
                if (err) {
                  return reject(err);
                } else {
                  console.log('Success:', res);

                  resolve({
                    id: res,
                    data: medium,
                    landmark_id: id
                  });
                }
              });
            });

          });

          return Promise.all(promises);

        })
        .then(media => {
          const m = client.multi();

          media.forEach(medium => {
            m.zadd(['landmarks:' + medium.landmark_id + ':media', +medium.data.date_taken, medium.id]);
            m.hmset('media:' + medium.id, medium.data);
          });

          return new Promise((resolve, reject) => {
            m.exec((err, res) => {
              if(err) {
                return reject(err);
              }

              console.log('Added media:', res);
              resolve(res);
            });
          });
        });
      });

    })
    .catch(err => {
      console.log('Error:', err);
    });
  }
};
