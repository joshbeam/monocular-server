import co from 'co';

export default class Worker {
  constructor({ map, queries, request }) {
    this.map = map;
    this.queries = queries;
    this.request = request;
  }

  getPhotos(landmark, num) {
    return co(function* () {

      let results = yield this.queries.map(query => {

      });

      return this.map(results);
    }.bind(this));
  }

  executeRequest() {
    return new Promise((resolve, reject) => {
      return this.request
    });
  }
};

// let flickrWorker = new Worker({
//   map(results) {
//     return _.uniq(_.flatten(results.filter(result => result !== undefined), true), 'photo.id').map(composePhotos);

//     function composePhotos() {
//       return;
//     }
//   },

//   queries: [
//     {

//     }
//   ]
// });
