#!/usr/bin/env node

import config from '../../src/config-local.js';
import co from 'co';
import redis from 'redis';

export default function(client, landmark) {
  console.log('made it here');

  return co(function*() {
    const id = yield getId.call(client);
    const { name, lat, lon, tags } = landmark;
    let errors = [];

    client.hmset('landmarks', {
      [landmark.name]: id
    }, collectError.bind(errors));

    client.hmset('landmarks:' + id, { name, lat, lon }, collectError.bind(errors));

    client.sadd('landmarks:' + id + ':tags', ...tags, collectError.bind(errors));

    return errors;

  }).catch(err => {
    console.log(err);

    client.quit();
  });
};

function getId() {
  return new Promise((resolve, reject) => {
    this.incr('next_landmark_id', (err, id) => {
      if(err) {
        reject(err);
      } else {
        resolve(id);
      }
    });
  });
}

function collectError(err, res) {
  if(err) {
    this.push(err);
  }

  if(res) {
    console.log(res);
  }
}
