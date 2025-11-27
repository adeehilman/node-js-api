const express = require('express');
const router = express.Router();
const auth = require('../src/controllers/authController');

router.post('/login', auth.login);
router.post('/refresh', auth.refresh);
// router.post('/logout', auth.logout);

module.exports = router;
