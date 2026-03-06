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
db.FoodItem = require('./foodItem.model')(sequelize, DataTypes);
db.DailyMealMenu = require('./dailyMealMenu.model')(sequelize, DataTypes);
db.DailyMealMenuItem = require('./dailyMealMenuItem.model')(sequelize, DataTypes);
db.MealOrder = require('./mealOrder.model')(sequelize, DataTypes);
db.MealOrderItem = require('./mealOrderItem.model')(sequelize, DataTypes);

// Associations
// Users
 db.User.hasMany(db.Booking, { foreignKey: 'user_id', as: 'bookings' });
 db.Booking.belongsTo(db.User, { foreignKey: 'user_id', as: 'customer' });

 db.User.hasMany(db.ServiceRequest, { foreignKey: 'assigned_staff_id', as: 'assigned_tickets' });
 db.ServiceRequest.belongsTo(db.User, { foreignKey: 'assigned_staff_id', as: 'assigned_staff' });

 db.User.hasMany(db.Feedback, { foreignKey: 'user_id', as: 'feedbacks' });
 db.Feedback.belongsTo(db.User, { foreignKey: 'user_id', as: 'customer' });
 db.User.hasMany(db.FoodItem, { foreignKey: 'created_by', as: 'created_food_items' });
 db.FoodItem.belongsTo(db.User, { foreignKey: 'created_by', as: 'creator' });
 db.User.hasMany(db.DailyMealMenu, { foreignKey: 'created_by', as: 'created_menus' });
 db.DailyMealMenu.belongsTo(db.User, { foreignKey: 'created_by', as: 'creator' });
 db.User.hasMany(db.MealOrder, { foreignKey: 'user_id', as: 'meal_orders' });
 db.MealOrder.belongsTo(db.User, { foreignKey: 'user_id', as: 'customer' });

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
 db.Booking.hasMany(db.MealOrder, { foreignKey: 'booking_id', as: 'meal_orders' });
 db.MealOrder.belongsTo(db.Booking, { foreignKey: 'booking_id', as: 'booking' });

 // Food menus
 db.DailyMealMenu.hasMany(db.DailyMealMenuItem, { foreignKey: 'daily_menu_id', as: 'menu_items' });
 db.DailyMealMenuItem.belongsTo(db.DailyMealMenu, { foreignKey: 'daily_menu_id', as: 'menu' });
 db.FoodItem.hasMany(db.DailyMealMenuItem, { foreignKey: 'food_item_id', as: 'menu_entries' });
 db.DailyMealMenuItem.belongsTo(db.FoodItem, { foreignKey: 'food_item_id', as: 'food_item' });

 // Meal orders
 db.Room.hasMany(db.MealOrder, { foreignKey: 'room_id', as: 'meal_orders' });
 db.MealOrder.belongsTo(db.Room, { foreignKey: 'room_id', as: 'room' });
 db.MealOrder.hasMany(db.MealOrderItem, { foreignKey: 'meal_order_id', as: 'order_items' });
 db.MealOrderItem.belongsTo(db.MealOrder, { foreignKey: 'meal_order_id', as: 'order' });
 db.FoodItem.hasMany(db.MealOrderItem, { foreignKey: 'food_item_id', as: 'ordered_items' });
 db.MealOrderItem.belongsTo(db.FoodItem, { foreignKey: 'food_item_id', as: 'food_item' });

module.exports = db;
