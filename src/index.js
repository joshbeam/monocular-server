import app from './app.js';

var http = require('http');
var server = http.createServer(app);
var port = '1337';

app.set('port', port);
server.listen(port);

server.on('error', onError);
server.on('listening', onListening);

function onError() {
  console.log('error');
}

function onListening() {
  console.log('Listening on port', port);
}