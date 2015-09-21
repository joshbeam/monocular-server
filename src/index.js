import app from './app.js';
import workers from './workers';

var http = require('http');
var server = http.createServer(app);
var port = '1337';

setInterval(workers.scrape, 36000);

app.set('port', port);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
  console.log('woah dude, error');
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  console.log('Listening on port', port);
}