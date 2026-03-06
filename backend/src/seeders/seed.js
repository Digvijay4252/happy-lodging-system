require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../models');

const seed = async () => {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync({ alter: false });

    const adminPass = await bcrypt.hash('Admin@123', 10);
    const [admin] = await db.User.findOrCreate({
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

    const foods = [
      { name: 'Idli Sambar', description: 'South Indian breakfast', category: 'Veg', price: 120 },
      { name: 'Masala Dosa', description: 'Crispy dosa with potato filling', category: 'Veg', price: 180 },
      { name: 'Veg Thali', description: 'Rice, dal, sabzi and roti', category: 'Veg', price: 260 },
      { name: 'Chicken Biryani', description: 'Aromatic dum biryani', category: 'NonVeg', price: 320 },
      { name: 'Paneer Butter Masala', description: 'Paneer curry with gravy', category: 'Veg', price: 280 },
      { name: 'Grilled Fish', description: 'Herb grilled fish fillet', category: 'NonVeg', price: 360 },
    ];

    const seededFoodItems = [];
    for (const food of foods) {
      const [item] = await db.FoodItem.findOrCreate({
        where: { name: food.name },
        defaults: {
          ...food,
          is_active: true,
          created_by: admin.id,
        },
      });
      seededFoodItems.push(item);
    }

    const today = new Date().toISOString().slice(0, 10);
    const menuSlots = ['Breakfast', 'Lunch', 'Dinner'];
    for (const slot of menuSlots) {
      const [menu] = await db.DailyMealMenu.findOrCreate({
        where: { menu_date: today, meal_slot: slot },
        defaults: { menu_date: today, meal_slot: slot, source_type: 'Manual', created_by: admin.id },
      });

      const slotFoodIds =
        slot === 'Breakfast'
          ? seededFoodItems.slice(0, 2).map((f) => f.id)
          : slot === 'Lunch'
            ? seededFoodItems.slice(2, 4).map((f) => f.id)
            : seededFoodItems.slice(4, 6).map((f) => f.id);

      for (const foodId of slotFoodIds) {
        await db.DailyMealMenuItem.findOrCreate({
          where: { daily_menu_id: menu.id, food_item_id: foodId },
          defaults: { daily_menu_id: menu.id, food_item_id: foodId },
        });
      }
    }

    const customerPass = await bcrypt.hash('Customer@123', 10);
    const [customer] = await db.User.findOrCreate({
      where: { email: 'customer1@hotel.com' },
      defaults: {
        name: 'Customer1',
        email: 'customer1@hotel.com',
        password: customerPass,
        role: 'customer',
        status: 'active',
      },
    });

    const room101 = await db.Room.findOne({ where: { room_number: '101' } });
    if (room101) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      const checkIn = tomorrow.toISOString().slice(0, 10);
      const checkOut = dayAfter.toISOString().slice(0, 10);

      let booking = await db.Booking.findOne({
        where: { user_id: customer.id, room_id: room101.id, check_in: checkIn, check_out: checkOut },
      });
      if (!booking) {
        booking = await db.Booking.create({
          booking_id: `BKG-${uuidv4().split('-')[0].toUpperCase()}`,
          user_id: customer.id,
          room_id: room101.id,
          check_in: checkIn,
          check_out: checkOut,
          total_amount: Number(room101.price),
          status: 'Booked',
          payment_status: 'Pending',
        });
      }

      const breakfastMenu = await db.DailyMealMenu.findOne({ where: { menu_date: today, meal_slot: 'Breakfast' } });
      const breakfastItems = breakfastMenu
        ? await db.DailyMealMenuItem.findAll({ where: { daily_menu_id: breakfastMenu.id }, limit: 1, raw: true })
        : [];
      if (booking && breakfastItems.length) {
        const food = await db.FoodItem.findByPk(breakfastItems[0].food_item_id);
        if (food) {
          let mealOrder = await db.MealOrder.findOne({
            where: { user_id: customer.id, booking_id: booking.id, order_date: checkIn, meal_slot: 'Breakfast' },
          });
          if (!mealOrder) {
            mealOrder = await db.MealOrder.create({
              order_code: `MEL-${uuidv4().split('-')[0].toUpperCase()}`,
              user_id: customer.id,
              booking_id: booking.id,
              room_id: room101.id,
              order_date: checkIn,
              meal_slot: 'Breakfast',
              serving_type: 'RoomDelivery',
              total_amount: Number(food.price),
              status: 'Placed',
              notes: 'Seed meal order',
            });
          }
          await db.MealOrderItem.findOrCreate({
            where: { meal_order_id: mealOrder.id, food_item_id: food.id },
            defaults: {
              meal_order_id: mealOrder.id,
              food_item_id: food.id,
              qty: 1,
              unit_price: Number(food.price),
              line_total: Number(food.price),
            },
          });
        }
      }
    }

    console.log('Seed completed');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
