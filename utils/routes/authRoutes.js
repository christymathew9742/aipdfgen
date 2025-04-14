const express = require('express');
const router = express.Router();
const { signUp, login,getCurrentUser} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const userMiddleware = require('../middlewares/userMiddleware');

router.post('/signup', signUp);
router.post('/login', login);
router.put('/profile/:userId', authMiddleware, userMiddleware, (req, res, next) => {
    const { updateUserProfile } = require('../controllers/userController');
    updateUserProfile(req, res, next);
});
router.get('/user', authMiddleware, getCurrentUser);

module.exports = router;

