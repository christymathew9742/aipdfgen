const { body, validationResult } = require('express-validator');

const validateAiResponse = [
    body('prompt')
        .notEmpty()
        .withMessage('AI prompt is required')
        .isString()
];

const aiValidate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
        success: false,
        errors: errors.array(),
        });
    }
    next();
};

module.exports = { validateAiResponse, aiValidate };


