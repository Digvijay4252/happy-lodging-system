const { Op, fn, col, literal } = require('sequelize');
const db = require('../models');
const { predictRevenue } = require('../services/analytics.service');

exports.dashboard = async (req, res, next) => {
  try {
    const totalBookings = await db.Booking.count();
    const totalRevenue = await db.Booking.sum('total_amount', {
      where: { payment_status: 'Paid' },
    });
    const availableRoomsCount = await db.Room.count({ where: { status: 'Available' } });
    const occupiedRoomsCount = await db.Room.count({ where: { status: 'Occupied' } });
    const totalRooms = await db.Room.count();

    const occupancyRate = totalRooms ? Number(((occupiedRoomsCount / totalRooms) * 100).toFixed(2)) : 0;

    const monthly = await db.Booking.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'month'],
        [fn('SUM', col('total_amount')), 'revenue'],
        [fn('COUNT', col('id')), 'bookings'],
      ],
      where: { payment_status: 'Paid' },
      group: [literal('month')],
      order: [[literal('month'), 'ASC']],
      raw: true,
    });

    const predictedRevenue = predictRevenue(monthly.map((m) => Number(m.revenue)));

    return res.json({
      totalBookings,
      totalRevenue: Number(totalRevenue || 0),
      occupancyRate,
      availableRoomsCount,
      monthly,
      predictedRevenue,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await db.Booking.findAll({
      include: [
        { model: db.User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: db.Room, as: 'room', include: [{ model: db.RoomImage, as: 'images', attributes: ['id', 'image_url'] }] },
        { model: db.Payment, as: 'payments' },
      ],
      order: [['id', 'DESC']],
    });

    return res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['Booked', 'CheckedIn', 'CheckedOut', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    const booking = await db.Booking.findByPk(req.params.id, { include: [{ model: db.Room, as: 'room' }] });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    await booking.update({ status });

    if (status === 'Cancelled' || status === 'CheckedOut') {
      await booking.room.update({ status: 'Available' });
    }

    return res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    next(error);
  }
};

exports.getCustomers = async (req, res, next) => {
  try {
    const customers = await db.User.findAll({ where: { role: 'customer' }, attributes: { exclude: ['password'] } });
    return res.json({ customers });
  } catch (error) {
    next(error);
  }
};

exports.toggleUserBlock = async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const nextStatus = user.status === 'active' ? 'blocked' : 'active';
    await user.update({ status: nextStatus });

    return res.json({ message: `User ${nextStatus}`, user: { id: user.id, status: user.status } });
  } catch (error) {
    next(error);
  }
};

exports.listStaff = async (req, res, next) => {
  try {
    const staff = await db.User.findAll({ where: { role: 'staff' }, attributes: { exclude: ['password'] } });
    return res.json({ staff });
  } catch (error) {
    next(error);
  }
};

exports.updateStaff = async (req, res, next) => {
  try {
    const staff = await db.User.findOne({ where: { id: req.params.id, role: 'staff' } });
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const { name, status } = req.body;
    await staff.update({
      name: name || staff.name,
      status: status || staff.status,
    });

    return res.json({ message: 'Staff updated', staff });
  } catch (error) {
    next(error);
  }
};

exports.deleteStaff = async (req, res, next) => {
  try {
    const staff = await db.User.findOne({ where: { id: req.params.id, role: 'staff' } });
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    await staff.destroy();
    return res.json({ message: 'Staff removed' });
  } catch (error) {
    next(error);
  }
};

exports.reports = async (req, res, next) => {
  try {
    const monthlyRevenue = await db.Booking.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'month'],
        [fn('SUM', col('total_amount')), 'revenue'],
      ],
      where: { payment_status: 'Paid' },
      group: [literal('month')],
      order: [[literal('month'), 'ASC']],
      raw: true,
    });

    const occupancy = await db.Room.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    return res.json({
      monthlyRevenue,
      occupancy,
      exportNote: 'For PDF export, call this endpoint and convert JSON to PDF in frontend or dedicated service.',
    });
  } catch (error) {
    next(error);
  }
};

exports.listFeedbacks = async (req, res, next) => {
  try {
    const { q, sentiment, feedback_type } = req.query;
    const where = {};
    if (sentiment) where.sentiment = sentiment;
    if (feedback_type) where.feedback_type = feedback_type;

    const feedbacks = await db.Feedback.findAll({
      where,
      include: [
        {
          model: db.Booking,
          as: 'booking',
          include: [{ model: db.Room, as: 'room', attributes: ['id', 'room_number', 'type'] }],
        },
        { model: db.User, as: 'customer', attributes: ['id', 'name', 'email'] },
      ],
      order: [['id', 'DESC']],
    });

    const filtered = q
      ? feedbacks.filter((f) => {
          const s = String(q).toLowerCase();
          return (
            String(f.comment || '')
              .toLowerCase()
              .includes(s) ||
            String(f.customer?.name || '')
              .toLowerCase()
              .includes(s) ||
            String(f.booking?.booking_id || '')
              .toLowerCase()
              .includes(s) ||
            String(f.booking?.room?.room_number || '')
              .toLowerCase()
              .includes(s) ||
            String(f.feedback_type || '')
              .toLowerCase()
              .includes(s)
          );
        })
      : feedbacks;

    return res.json({ feedbacks: filtered });
  } catch (error) {
    next(error);
  }
};
