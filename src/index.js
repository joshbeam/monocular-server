import app from './app.js';

var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var port = '1337';

app.set('port', port);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

io.on('connection', (socket) => {
  console.log('user connected');
});

function onError(error) {
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