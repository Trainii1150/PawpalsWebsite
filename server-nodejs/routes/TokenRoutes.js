const express = require('express');
const router = express.Router();
const { AuthToken, refreshToken } = require('../middleware/authmid');

router.post('/refresh-token', refreshToken);

module.exports = router;

