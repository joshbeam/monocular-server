var express = require('express');
var app = express();

import routes from './routes';
import headers from './routes/headers.js';

app.use(headers);

app.use('/api/1.0/', routes);

export default app;
