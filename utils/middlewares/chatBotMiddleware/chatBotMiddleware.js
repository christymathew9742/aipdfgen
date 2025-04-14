const { body, validationResult } = require('express-validator');

const validateChatBot = [
    body('title')
      .notEmpty()
      .withMessage('Edges is required'),
    body('edges')
        .notEmpty()
        .withMessage('Edges is required'),
    body('nodes')
        .notEmpty()
        .withMessage('Nodes is required'),
    body('status')
        .notEmpty()
        .withMessage('Nodes is required'),
    body('botnum')
        .notEmpty()
        .withMessage('Bot Number is required'),
    body('viewport')
        .notEmpty()
        .withMessage('Viewport is required')
];

const Validation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }
    next();
};

module.exports = { validateChatBot, Validation };
