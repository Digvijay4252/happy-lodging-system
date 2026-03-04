const { body } = require('express-validator');

exports.createRoomValidation = [
  body('room_number').notEmpty().withMessage('Room number is required'),
  body('type').isIn(['Single', 'Double', 'Deluxe', 'Suite']).withMessage('Invalid room type'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
];

exports.createBookingValidation = [
  body('room_id').isInt({ gt: 0 }).withMessage('Valid room_id is required'),
  body('check_in').isDate().withMessage('Valid check_in date required'),
  body('check_out').isDate().withMessage('Valid check_out date required'),
];
