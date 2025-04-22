const { body, validationResult } = require('express-validator');

// Validate uploader input
const validateUploader = [
    body('originalName')
        .notEmpty()
        .withMessage('originalName name is required')
        .isString()
        .withMessage('originalName name must be a string'),
    body('mimeType')
        .notEmpty()
        .withMessage('mimeType name is required')
        .isString()
        .withMessage('mimeType name must be a string'),
    body('size')
        .notEmpty()
        .withMessage('size name is required')
        .isNumeric()
        .withMessage('size name must be a number'),
    body('path')
        .notEmpty()
        .withMessage('path name is required')
        .isString()
        .withMessage('path name must be a string'),
    body('path')
        .notEmpty()
        .withMessage('path name is required')
        .isString()
        .withMessage('path name must be a string'),

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

module.exports = { validateUploader, validate };

