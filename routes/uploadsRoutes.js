const express = require('express');
const { uploadFile } = require('../controllers/uploadController');
const multer = require('multer');
const {validateUploader,validate} = require('../middlewares/uploadValidater');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({ storage, fileFilter });

// Upload route
router.post('/', upload.single('file'), uploadFile);

module.exports = router;
