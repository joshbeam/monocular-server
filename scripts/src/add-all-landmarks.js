#!/usr/bin/env node

require('babel/polyfill');

import fs from 'fs';
import config from '../../src/config-local.js';
import redis from 'redis';
import parse from 'csv-parse';
import co from 'co';
import add from './add-landmark';
const landmarkData = fs.readFileSync(__dirname + '/../../csv/landmarks.csv', 'utf8');

const client = redis.createClient(config.redislabs.port, config.redislabs.host, {
  auth_pass: config.redislabs.password
});

co(function*() {
  let output = yield new Promise((resolve, reject) => {
    parse(landmarkData, (err, output) => {
      resolve(output);
    });
  });

  const fields = output.shift();

  const landmarks = output.map(landmark => {
    let obj = {};

    fields.map((field, i) => {
      obj[field] = landmark[i];
    });

    return obj;
  }).map(landmark => {

    // all tags fields should be an array
    landmark.tags = landmark.tags.split(', ');

    return landmark;

  });

  return landmarks;
}).then(landmarks => {
  Promise.all(landmarks.map(l => {
    return add(client, l);
  })).then(res => {
    console.log(res);
  });
});
