var express = require('express');
var router = express.Router();
var _ = require('lodash');

import landmarks from './landmarks';

router.get('/landmarks/:name', landmarks.one);
router.get('/landmarks', landmarks.all);

export default router;
