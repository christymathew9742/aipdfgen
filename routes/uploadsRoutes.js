const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { uploadFile } = require('../controllers/uploadController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const today = new Date().toISOString().split('T')[0];
        const subfolder = `PDF-${today}`;
        const uploadPath = path.join(process.cwd(), 'uploads', subfolder);
        fs.mkdirSync(uploadPath, { recursive: true });
        req.uploadFolderPath = subfolder;
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const cleanName = file.originalname.replace(/\s+/g, '-');
        const fileName = `${uniqueId}-${cleanName}`;
        req.uploadedFileId = uniqueId;
        cb(null, fileName);
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

router.post('/', upload.single('file'), uploadFile);

module.exports = router;
