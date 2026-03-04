const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const optionalAuthMiddleware = require('../middleware/optionalAuth.middleware');
const { registerValidation, loginValidation, adminRegisterValidation } = require('../validators/auth.validator');

router.post('/register', registerValidation, authController.customerRegister);
router.post('/admin/register', optionalAuthMiddleware, adminRegisterValidation, authController.adminRegister);
router.post('/login', loginValidation, authController.login);
router.post('/staff/register', registerValidation, authController.staffRegisterByAdmin);

module.exports = router;
