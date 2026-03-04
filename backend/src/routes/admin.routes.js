const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const { registerValidation } = require('../validators/auth.validator');

router.use(authMiddleware, roleMiddleware('admin'));

router.get('/dashboard', adminController.dashboard);
router.get('/bookings', adminController.getAllBookings);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);
router.get('/customers', adminController.getCustomers);
router.patch('/customers/:id/toggle-block', adminController.toggleUserBlock);
router.get('/staff', adminController.listStaff);
router.post('/staff', registerValidation, authController.staffRegisterByAdmin);
router.put('/staff/:id', adminController.updateStaff);
router.delete('/staff/:id', adminController.deleteStaff);
router.get('/reports', adminController.reports);
router.get('/feedbacks', adminController.listFeedbacks);

module.exports = router;
