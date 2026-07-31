const express = require('express');
const router = express.Router();
const { getCurrentUser, updateProfile } = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/me', verifyToken, getCurrentUser);
router.put('/me', verifyToken, updateProfile);

module.exports = router;