const express = require('express');
const router = express.Router();
const { getHisTory } = require('../controllers/hisController');

router.post('/', getHisTory);

module.exports = router;
