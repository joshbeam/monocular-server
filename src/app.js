var express = require('express');
var app = express();

import routes from './routes';

app.use('/api/1.0/', routes);

export default app;
