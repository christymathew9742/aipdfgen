const { errorResponse } = require('../../utils/errorResponse');
const {createDepartmentResponse} = require('../../services/departmentService/drDepartment')

//create Department data
const createDepartmentData = async (req, res, next) => {
    try {
        if (!req.user || !req.user.userId) {
            return next(errorResponse('user not responding ', 401));
        }
        // manage tocken
        const departmentData = req.body;
        departmentData.tokenStatus = departmentData.totalToken;
        departmentData.currentToken = 0;
        departmentData.user = req.user.userId;
        const newAiResponse = await createDepartmentResponse(departmentData);
        res.status(201).json({ success: true, data: newAiResponse });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createDepartmentData, 
};