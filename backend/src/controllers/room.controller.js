const { Op } = require('sequelize');
const db = require('../models');
const validate = require('../utils/validate.util');

exports.listRooms = async (req, res, next) => {
  try {
    const { type, minPrice, maxPrice, checkIn, checkOut, status } = req.query;
    if ((checkIn && !checkOut) || (!checkIn && checkOut)) {
      return res.status(400).json({ message: 'Both checkIn and checkOut are required for availability search' });
    }
    if (checkIn && checkOut && new Date(checkIn) >= new Date(checkOut)) {
      return res.status(400).json({ message: 'checkOut must be after checkIn' });
    }

    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    const rooms = await db.Room.findAll({
      where,
      include: [{ model: db.RoomImage, as: 'images', attributes: ['id', 'image_url'] }],
      order: [['id', 'ASC']],
    });

    if (!checkIn || !checkOut) {
      return res.json({ rooms });
    }

    const bookedRoomIds = await db.Booking.findAll({
      attributes: ['room_id'],
      where: {
        status: { [Op.in]: ['Booked', 'CheckedIn'] },
        // Overlap when existing.check_in < requested.check_out AND existing.check_out > requested.check_in
        check_in: { [Op.lt]: checkOut },
        check_out: { [Op.gt]: checkIn },
      },
      raw: true,
    });

    const conflictIds = new Set(bookedRoomIds.map((b) => b.room_id));
    const availableRooms = rooms.filter((room) => !conflictIds.has(room.id));

    return res.json({ rooms: availableRooms });
  } catch (error) {
    next(error);
  }
};

exports.getRoomById = async (req, res, next) => {
  try {
    const room = await db.Room.findByPk(req.params.id, {
      include: [{ model: db.RoomImage, as: 'images', attributes: ['id', 'image_url'] }],
    });

    if (!room) return res.status(404).json({ message: 'Room not found' });

    return res.json(room);
  } catch (error) {
    next(error);
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    validate(req);
    const { room_number, type, price, status, description, amenities } = req.body;

    const room = await db.Room.create({
      room_number,
      type,
      price,
      status: status || 'Available',
      description,
      amenities: amenities || [],
    });

    return res.status(201).json({ message: 'Room created', room });
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const room = await db.Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    await room.update(req.body);

    return res.json({ message: 'Room updated', room });
  } catch (error) {
    next(error);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await db.Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    await room.destroy();
    return res.json({ message: 'Room deleted' });
  } catch (error) {
    next(error);
  }
};

exports.addRoomImage = async (req, res, next) => {
  try {
    const room = await db.Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;
    if (!imageUrl) return res.status(400).json({ message: 'Image is required' });

    const image = await db.RoomImage.create({ room_id: room.id, image_url: imageUrl });
    return res.status(201).json({ message: 'Image added', image });
  } catch (error) {
    next(error);
  }
};
