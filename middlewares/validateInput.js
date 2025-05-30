const { body, validationResult } = require('express-validator');

// Validate product input
const validateProductInput = [
    body('name')
        .notEmpty()
        .withMessage('Product name is required')
        .isString()
        .withMessage('Product name must be a string'),
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
        success: false,
        errors: errors.array(),
        });
    }
    next();
};

module.exports = { validateProductInput, validate };


