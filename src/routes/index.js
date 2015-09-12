var express = require('express');
var router = express.Router();
var _ = require('lodash');

import landmark from './landmark';

router.get('/landmark/:name', landmark);

export default router;
