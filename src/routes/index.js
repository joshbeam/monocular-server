var express = require('express');
var router = express.Router();

import landmark from './landmark';

router.get('/landmark/:name', landmark);

export default router;
