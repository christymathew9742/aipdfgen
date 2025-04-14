const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const registerUserService = async ({ username, email, password,confirmPassword}) => {
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('Email already in use');
        }
        const user = new User({ username, email, password,confirmPassword});
        await user.save();

        // Create JWT token
       const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
       //const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        return { user, token };
    } catch (error) {
        throw error;
    }
};

const loginUserService = async ({ email, password }) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const passwordMatch = bcrypt.compareSync(password, user.password);
        if (!passwordMatch) {
            throw new Error('Invalid credentials');
        }

        // Create JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        //const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);


        return { user, token };
    } catch (error) {
        throw error;
    }
};

module.exports = {
  registerUserService,
  loginUserService
};
