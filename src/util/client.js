import config from '../config-local.js';
import redis from 'redis';

export default redis.createClient(config.redislabs.port, config.redislabs.host, {
  auth_pass: config.redislabs.password
});
