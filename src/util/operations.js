import client from './client.js';

export default {
  getLandmarks() {
    return new Promise((resolve, reject) => {
      client.sort(['landmarks', 'asc'], (err, res) => {
        if(err) {
          return reject(err);
        }

        const m = client.multi();

        res.forEach(id => {
          m.hgetall('landmarks:' + id);
          m.echo(id);
          m.smembers('landmarks:' + id + ':tags');
          m.zrange(['landmarks:' + id + ':media', 0, -1]);
        });

        m.exec((err, res) => {
          if(err) {
            return reject(err);
          }

          // res: [{landmark}, [tags], [media]]
          resolve(res.map((item, i) => {
            item.name = item.name.toLowerCase().split(' ').join('_');
            item.id = res[i+1];
            item.tags = res[i+2];
            item.media = res[i+3];

            res.splice(i+1, 3);

            return item;
          }).filter(item => {
            return item !== undefined;
          }));

        });
      });
    });
  },
  getMedia(key, numPhotos) {
    return new Promise((resolve, reject) => {
      let limit = numPhotos ? 'limit 0 ' + numPhotos + ' ' : '';

      let query = [key]
      .concat((limit + 'desc by media:*->date_taken get media:*->date_taken get media:*->src get media:*->url').split(' '));

      console.log(query);

      client.sort(query, (err, res) => {
        if(err) {
          return reject(err);
        }

        console.log('Success:', res.length);
        let media = res.map((item, i) => {
          let group = res.slice(i, i+3);

          res.splice(i+1, 2);

          return {
            date_taken: group[0],
            src: group[1],
            url: group[2]
          };
        }).filter(item => item !== undefined);

        resolve(media);
      });
    });

  }
};
