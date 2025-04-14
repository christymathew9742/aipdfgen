const { registerUserService, loginUserService } = require('../services/authService');
const { errorResponse } = require('../utils/errorResponse');
const User = require('../models/User');
const VerifyToken = require('../models/VerifyToken'); 

// Sign up a new user
const signUp = async (req, res, next) => {
    const { username, email, password,confirmPassword} = req.body;

    try {
        const { user, token } = await registerUserService({ username, email, password,confirmPassword});

        res.status(201).json({
            success: true,
            message: 'Registration completed successfully',
            data: {
                user: {
                    userId: user._id,
                    username: user.username,
                    email: user.email,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};


//generate verify tocken
const saveVerifyToken = async (userId) => {
    try {
        const token = `token_${userId}_${Date.now()}`;
        await VerifyToken.create({
            userId,
            verifyToken: token,
        });
        return token;
    } catch (error) {
        console.error('Error saving verify token:', error);
        throw new Error('Could not save verify token');
    }
};

// Login a user and generate a JWT token
const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const { user, token } = await loginUserService({ email, password });
        const verifyToken = await saveVerifyToken(user._id); 
        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            data: {
                user: {
                    userId: user._id,
                    username: user.username,
                    email: user.email,
                },
                token,
                verifyToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get current user
const getCurrentUser = async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId).select('-password');
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
};

module.exports = {
    signUp,
    login,
    getCurrentUser,
};
