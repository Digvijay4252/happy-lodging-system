const express = require('express');
const router = express.Router();

const staffController = require('../controllers/staff.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.use(authMiddleware, roleMiddleware('staff', 'admin'));

router.get('/bookings', staffController.listBookings);
router.get('/rooms', staffController.listRooms);

router.patch('/bookings/:id/check-in', staffController.checkIn);
router.patch('/bookings/:id/check-out', staffController.checkOut);
router.patch('/rooms/:id/status', staffController.updateRoomStatus);

router.get('/tickets', staffController.listServiceTickets);
router.post('/tickets', staffController.createServiceTicket);
router.patch('/tickets/:id', staffController.updateServiceTicket);
router.get('/feedbacks', staffController.listFeedbacks);

module.exports = router;
