const express = require('express');
const {createDepartmentData} = require('../../controllers/departmentController/drDepartment');
const {validatedepartment, Validation} = require('../../middlewares/departmentMiddleware/drMiddleware')
const authMiddleware = require('../../middlewares/authMiddleware');
const router = express.Router();

router.post('/',authMiddleware,validatedepartment,Validation,createDepartmentData);

module.exports = router;