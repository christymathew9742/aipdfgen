const { body, validationResult } = require('express-validator');

const validatedepartment = [
    body('doctor')
        .notEmpty()
        .withMessage('Doctor name required')
        .isString(),
    body('department')
        .notEmpty()
        .withMessage('Department  is required')
        .isString(),
    body('date')
        .notEmpty()
        .withMessage('Date  is required')
        .isString(),
    body('totalToken')
        .notEmpty()
        .withMessage('Token cound is required')
        .isNumeric(),
    body('drStatus')
        .notEmpty()
        .isBoolean(),
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

module.exports = { validatedepartment, Validation };





