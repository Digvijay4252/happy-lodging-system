require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../models');

const seed = async () => {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync({ alter: false });

    const adminPass = await bcrypt.hash('Admin@123', 10);
    await db.User.findOrCreate({
      where: { email: 'admin@hotel.com' },
      defaults: {
        name: 'System Admin',
        email: 'admin@hotel.com',
        password: adminPass,
        role: 'admin',
        status: 'active',
      },
    });

    const rooms = [
      { room_number: '101', type: 'Single', price: 2500, status: 'Available', description: 'Comfort single room', amenities: ['WiFi', 'TV'] },
      { room_number: '102', type: 'Double', price: 4000, status: 'Available', description: 'Double room with balcony', amenities: ['WiFi', 'TV', 'Balcony'] },
      { room_number: '201', type: 'Deluxe', price: 6500, status: 'Available', description: 'Deluxe city view', amenities: ['WiFi', 'TV', 'Mini Bar'] },
      { room_number: '301', type: 'Suite', price: 10000, status: 'Available', description: 'Luxury suite', amenities: ['WiFi', 'TV', 'Mini Bar', 'Living Area'] },
    ];

    for (const roomData of rooms) {
      await db.Room.findOrCreate({ where: { room_number: roomData.room_number }, defaults: roomData });
    }

    console.log('Seed completed');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
