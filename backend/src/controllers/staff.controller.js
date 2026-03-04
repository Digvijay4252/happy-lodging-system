const { Op } = require('sequelize');
const db = require('../models');

const findBookingByIdOrCode = async (identifier) => {
  if (!identifier) return null;
  const include = [{ model: db.Room, as: 'room' }];

  const asNumber = Number(identifier);
  if (!Number.isNaN(asNumber)) {
    const byId = await db.Booking.findByPk(asNumber, { include });
    if (byId) return byId;
  }

  return db.Booking.findOne({
    where: { booking_id: String(identifier) },
    include,
  });
};

exports.checkIn = async (req, res, next) => {
  try {
    const booking = await findBookingByIdOrCode(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'Cancelled') return res.status(400).json({ message: 'Cancelled booking cannot be checked in' });
    if (booking.status === 'CheckedOut') return res.status(400).json({ message: 'Checked-out booking cannot be checked in' });

    await booking.update({ status: 'CheckedIn' });
    await booking.room.update({ status: 'Occupied' });

    return res.json({ message: 'Customer checked-in', booking });
  } catch (error) {
    next(error);
  }
};

exports.checkOut = async (req, res, next) => {
  try {
    const booking = await findBookingByIdOrCode(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'Cancelled') return res.status(400).json({ message: 'Cancelled booking cannot be checked out' });

    await booking.update({ status: 'CheckedOut' });
    await booking.room.update({ status: 'Available' });

    return res.json({
      message: 'Customer checked-out',
      final_bill: {
        booking_id: booking.booking_id,
        total_amount: booking.total_amount,
        payment_status: booking.payment_status,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRoomStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const room = await db.Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    await room.update({ status });
    return res.json({ message: 'Room status updated', room });
  } catch (error) {
    next(error);
  }
};

exports.createServiceTicket = async (req, res, next) => {
  try {
    const { booking_id, description, assigned_staff_id } = req.body;

    const booking = await db.Booking.findByPk(booking_id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const ticket = await db.ServiceRequest.create({
      booking_id,
      description,
      assigned_staff_id: assigned_staff_id || req.user.id,
      status: 'Open',
    });

    return res.status(201).json({ message: 'Service ticket created', ticket });
  } catch (error) {
    next(error);
  }
};

exports.updateServiceTicket = async (req, res, next) => {
  try {
    const ticket = await db.ServiceRequest.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Service ticket not found' });

    const { status, assigned_staff_id } = req.body;
    const allowedStatuses = ['Open', 'InProgress', 'Resolved', 'Closed'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid ticket status' });
    }

    if (assigned_staff_id) {
      const staff = await db.User.findOne({ where: { id: assigned_staff_id, role: 'staff' } });
      if (!staff) {
        return res.status(400).json({ message: 'assigned_staff_id must be a valid staff user' });
      }
    }

    await ticket.update({
      status: status || ticket.status,
      assigned_staff_id: assigned_staff_id || ticket.assigned_staff_id,
    });

    return res.json({ message: 'Service ticket updated', ticket });
  } catch (error) {
    next(error);
  }
};

exports.listServiceTickets = async (req, res, next) => {
  try {
    const tickets = await db.ServiceRequest.findAll({
      include: [
        {
          model: db.Booking,
          as: 'booking',
          include: [{ model: db.Room, as: 'room', attributes: ['id', 'room_number', 'type'] }],
        },
        { model: db.User, as: 'assigned_staff', attributes: ['id', 'name', 'email'] },
      ],
      order: [['id', 'DESC']],
    });

    return res.json({ tickets });
  } catch (error) {
    next(error);
  }
};

exports.listBookings = async (req, res, next) => {
  try {
    const { q, status, checkInFrom, checkInTo } = req.query;
    const where = {};

    if (status) {
      const statuses = String(status)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      where.status = statuses.length > 1 ? { [Op.in]: statuses } : statuses[0];
    }
    if (checkInFrom || checkInTo) {
      where.check_in = {};
      if (checkInFrom) where.check_in[Op.gte] = checkInFrom;
      if (checkInTo) where.check_in[Op.lte] = checkInTo;
    }
    if (q) {
      const asNumber = Number(q);
      where[Op.or] = [{ booking_id: { [Op.like]: `%${q}%` } }];
      if (!Number.isNaN(asNumber)) {
        where[Op.or].push({ id: asNumber }, { room_id: asNumber });
      }
    }

    const bookings = await db.Booking.findAll({
      where,
      include: [
        { model: db.Room, as: 'room', attributes: ['id', 'room_number', 'type', 'status'] },
        { model: db.User, as: 'customer', attributes: ['id', 'name', 'email'] },
      ],
      order: [['id', 'DESC']],
    });

    return res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

exports.listRooms = async (req, res, next) => {
  try {
    const { q, status } = req.query;
    const where = {};

    if (status) where.status = status;
    if (q) {
      where[Op.or] = [{ room_number: { [Op.like]: `%${q}%` } }, { type: { [Op.like]: `%${q}%` } }];
    }

    const rooms = await db.Room.findAll({
      where,
      order: [['room_number', 'ASC']],
      attributes: ['id', 'room_number', 'type', 'status', 'price'],
    });

    return res.json({ rooms });
  } catch (error) {
    next(error);
  }
};

exports.listFeedbacks = async (req, res, next) => {
  try {
    const { q, sentiment } = req.query;
    const where = {};
    if (sentiment) where.sentiment = sentiment;

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
              .includes(s)
          );
        })
      : feedbacks;

    return res.json({ feedbacks: filtered });
  } catch (error) {
    next(error);
  }
};
