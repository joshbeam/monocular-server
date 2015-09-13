import request from 'request';

let url = 'http://api.openweathermap.org/';
let route = 'data/2.5/'

export default {
  getWeather(lat, long, forecast) {
    return new Promise((resolve, reject) => {
      var resource = [url, route].join('');
      var params = {
        lat: lat,
        lon: long,
        units: 'imperial'
      };
      var type;

      if(typeof forecast !== 'undefined') {
        // 5 day
        type = 'forecast/';
      } else {
        // today
        type = 'weather/';
      }

      resource = [resource, type, '?', Object.keys(params).map((p) => (p + '=' + params[p])).join('&')].join('');

      request(resource, function(err, res, body) {
        var weather;

        if(err) {
          reject(err);
        } else {
          resolve(formattedWeather(JSON.parse(body), forecast));
        }
      });
    });
  }
};

function formattedWeather(raw, forecast) {
  if(forecast) {
    return raw;
  } else {
    return {
      temp: raw.main.temp,
      temp_min: raw.main.temp_min,
      temp_max: raw.main.temp_max,
      main: raw.weather[0].main.toLowerCase()
    };
  }
}