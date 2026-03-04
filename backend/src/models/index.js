const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const db = {};

db.sequelize = sequelize;
db.Sequelize = require('sequelize');

db.User = require('./user.model')(sequelize, DataTypes);
db.Room = require('./room.model')(sequelize, DataTypes);
db.RoomImage = require('./roomImage.model')(sequelize, DataTypes);
db.Booking = require('./booking.model')(sequelize, DataTypes);
db.Payment = require('./payment.model')(sequelize, DataTypes);
db.ServiceRequest = require('./serviceRequest.model')(sequelize, DataTypes);
db.Feedback = require('./feedback.model')(sequelize, DataTypes);

// Associations
// Users
 db.User.hasMany(db.Booking, { foreignKey: 'user_id', as: 'bookings' });
 db.Booking.belongsTo(db.User, { foreignKey: 'user_id', as: 'customer' });

 db.User.hasMany(db.ServiceRequest, { foreignKey: 'assigned_staff_id', as: 'assigned_tickets' });
 db.ServiceRequest.belongsTo(db.User, { foreignKey: 'assigned_staff_id', as: 'assigned_staff' });

 db.User.hasMany(db.Feedback, { foreignKey: 'user_id', as: 'feedbacks' });
 db.Feedback.belongsTo(db.User, { foreignKey: 'user_id', as: 'customer' });

// Rooms
 db.Room.hasMany(db.RoomImage, { foreignKey: 'room_id', as: 'images' });
 db.RoomImage.belongsTo(db.Room, { foreignKey: 'room_id', as: 'room' });

 db.Room.hasMany(db.Booking, { foreignKey: 'room_id', as: 'bookings' });
 db.Booking.belongsTo(db.Room, { foreignKey: 'room_id', as: 'room' });

// Bookings
 db.Booking.hasMany(db.Payment, { foreignKey: 'booking_id', as: 'payments' });
 db.Payment.belongsTo(db.Booking, { foreignKey: 'booking_id', as: 'booking' });

 db.Booking.hasMany(db.ServiceRequest, { foreignKey: 'booking_id', as: 'service_requests' });
 db.ServiceRequest.belongsTo(db.Booking, { foreignKey: 'booking_id', as: 'booking' });

 db.Booking.hasMany(db.Feedback, { foreignKey: 'booking_id', as: 'feedbacks' });
 db.Feedback.belongsTo(db.Booking, { foreignKey: 'booking_id', as: 'booking' });

module.exports = db;
