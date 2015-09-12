import app from '../app.js';
import landmark from './landmark.js';

app.get('/:name', landmark);

module.exports = app;
