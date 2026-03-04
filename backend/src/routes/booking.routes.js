const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const { createBookingValidation } = require('../validators/common.validator');

router.post('/', authMiddleware, roleMiddleware('customer'), createBookingValidation, bookingController.createBooking);
router.get('/me', authMiddleware, roleMiddleware('customer'), bookingController.getMyBookings);
router.patch('/:id/cancel', authMiddleware, roleMiddleware('customer'), bookingController.cancelBooking);
router.post('/:id/pay', authMiddleware, roleMiddleware('customer'), bookingController.simulatePayment);
router.post('/feedback', authMiddleware, roleMiddleware('customer'), bookingController.createFeedback);

module.exports = router;
