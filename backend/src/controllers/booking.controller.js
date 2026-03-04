const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const db = require('../models');
const validate = require('../utils/validate.util');

const nightsBetween = (checkIn, checkOut) => {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const ms = outDate - inDate;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

exports.createBooking = async (req, res, next) => {
  try {
    validate(req);
    const { room_id, check_in, check_out } = req.body;

    if (new Date(check_in) >= new Date(check_out)) {
      return res.status(400).json({ message: 'check_out must be after check_in' });
    }

    const room = await db.Room.findByPk(room_id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Do not allow new bookings for rooms that are under maintenance.
    if (room.status === 'Maintenance') {
      return res.status(400).json({ message: 'Room is under maintenance' });
    }

    const overlap = await db.Booking.findOne({
      where: {
        room_id,
        status: { [Op.in]: ['Booked', 'CheckedIn'] },
        // Overlap when existing.check_in < requested.check_out AND existing.check_out > requested.check_in
        check_in: { [Op.lt]: check_out },
        check_out: { [Op.gt]: check_in },
      },
    });

    if (overlap) {
      return res.status(409).json({ message: 'Room already booked for selected dates' });
    }

    const nights = nightsBetween(check_in, check_out);
    const total_amount = Number(room.price) * nights;

    const booking = await db.Booking.create({
      booking_id: `BKG-${uuidv4().split('-')[0].toUpperCase()}`,
      user_id: req.user.id,
      room_id,
      check_in,
      check_out,
      total_amount,
      status: 'Booked',
      payment_status: 'Pending',
    });

    return res.status(201).json({ message: 'Booking created', booking });
  } catch (error) {
    next(error);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await db.Booking.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: db.Room, as: 'room' },
        { model: db.Payment, as: 'payments' },
      ],
      order: [['id', 'DESC']],
    });

    return res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await db.Booking.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: db.Room, as: 'room' }],
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }
    if (booking.status === 'CheckedOut') {
      return res.status(400).json({ message: 'Checked-out booking cannot be cancelled' });
    }

    const today = new Date();
    const checkInDate = new Date(booking.check_in);

    if (today >= checkInDate) {
      return res.status(400).json({ message: 'Cancellation allowed only before check-in date' });
    }

    await booking.update({ status: 'Cancelled' });

    const activeCheckIn = await db.Booking.count({
      where: {
        room_id: booking.room_id,
        status: 'CheckedIn',
      },
    });
    await booking.room.update({ status: activeCheckIn > 0 ? 'Occupied' : 'Available' });

    return res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

exports.simulatePayment = async (req, res, next) => {
  try {
    const booking = await db.Booking.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot pay for cancelled booking' });
    }

    const statuses = ['Pending', 'Paid', 'Failed'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const transaction_id = `TXN-${uuidv4().replace(/-/g, '').slice(0, 16).toUpperCase()}`;

    const payment = await db.Payment.create({
      booking_id: booking.id,
      transaction_id,
      amount: booking.total_amount,
      status,
    });

    await booking.update({ payment_status: status });

    return res.json({ message: 'Payment processed (simulation)', payment });
  } catch (error) {
    next(error);
  }
};

exports.createFeedback = async (req, res, next) => {
  try {
    const { booking_id, comment } = req.body;

    const booking = await db.Booking.findOne({
      where: { id: booking_id, user_id: req.user.id, status: 'CheckedOut' },
    });

    if (!booking) {
      return res.status(400).json({ message: 'Feedback allowed for checked-out bookings only' });
    }

    const feedback = await db.Feedback.create({
      booking_id,
      user_id: req.user.id,
      comment,
      sentiment: null,
    });

    return res.status(201).json({ message: 'Feedback submitted', feedback });
  } catch (error) {
    next(error);
  }
};
