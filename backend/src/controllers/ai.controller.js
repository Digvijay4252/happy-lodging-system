const { Op } = require('sequelize');
const db = require('../models');
const { chatAssistant, sentimentFromText, getAiProviderStatus } = require('../services/ai.service');
const { predictRevenue } = require('../services/analytics.service');

const toCountMap = (rows, keyField = 'status', countField = 'count') => {
  const result = {};
  for (const row of rows || []) {
    const key = String(row[keyField] || 'Unknown');
    result[key] = Number(row[countField] || 0);
  }
  return result;
};

const buildAiContext = async (user, question) => {
  const safeQuestion = String(question || '').toLowerCase();
  const wantsRooms = safeQuestion.includes('room') || safeQuestion.includes('booking') || safeQuestion.includes('check');
  const wantsFood =
    safeQuestion.includes('food') ||
    safeQuestion.includes('meal') ||
    safeQuestion.includes('breakfast') ||
    safeQuestion.includes('lunch') ||
    safeQuestion.includes('dinner');
  const wantsSupport = safeQuestion.includes('issue') || safeQuestion.includes('ticket') || safeQuestion.includes('feedback');

  const [
    usersByRoleRows,
    roomsByStatusRows,
    bookingsByStatusRows,
    foodsByCategoryRows,
    activeRooms,
    latestFoodItems,
    latestMenus,
    latestTickets,
    latestFeedback,
    latestMealOrders,
  ] = await Promise.all([
    db.User.findAll({
      attributes: ['role', [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']],
      group: ['role'],
      raw: true,
    }),
    db.Room.findAll({
      attributes: ['status', [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    }),
    db.Booking.findAll({
      attributes: ['status', [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    }),
    db.FoodItem.findAll({
      attributes: ['category', [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']],
      group: ['category'],
      raw: true,
    }),
    db.Room.findAll({
      where: { status: 'Available' },
      attributes: ['id', 'room_number', 'type', 'price', 'status'],
      order: [['price', 'ASC']],
      limit: 10,
      raw: true,
    }),
    db.FoodItem.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'category', 'price'],
      order: [['id', 'DESC']],
      limit: 15,
      raw: true,
    }),
    db.DailyMealMenu.findAll({
      attributes: ['id', 'menu_date', 'meal_slot', 'source_type'],
      include: [{ model: db.DailyMealMenuItem, as: 'menu_items', include: [{ model: db.FoodItem, as: 'food_item', attributes: ['id', 'name', 'price'] }] }],
      order: [['menu_date', 'DESC'], ['id', 'DESC']],
      limit: 12,
    }),
    db.ServiceRequest.findAll({
      attributes: ['id', 'booking_id', 'status', 'description', 'created_at'],
      include: [{ model: db.User, as: 'assigned_staff', attributes: ['id', 'name'] }],
      order: [['id', 'DESC']],
      limit: 12,
    }),
    db.Feedback.findAll({
      attributes: ['id', 'booking_id', 'feedback_type', 'sentiment', 'comment', 'created_at'],
      include: [
        { model: db.User, as: 'customer', attributes: ['id', 'name'] },
        {
          model: db.Booking,
          as: 'booking',
          attributes: ['id', 'booking_id'],
          include: [{ model: db.Room, as: 'room', attributes: ['id', 'room_number', 'type'] }],
        },
      ],
      order: [['id', 'DESC']],
      limit: 12,
    }),
    db.MealOrder.findAll({
      attributes: ['id', 'order_code', 'booking_id', 'order_date', 'meal_slot', 'serving_type', 'status', 'total_amount'],
      include: [
        { model: db.User, as: 'customer', attributes: ['id', 'name'] },
        { model: db.Room, as: 'room', attributes: ['id', 'room_number', 'type'] },
      ],
      order: [['id', 'DESC']],
      limit: 12,
    }),
  ]);

  const globalContext = {
    generatedAt: new Date().toISOString(),
    userRole: user?.role || 'unknown',
    globalSummary: {
      usersByRole: toCountMap(usersByRoleRows, 'role'),
      roomsByStatus: toCountMap(roomsByStatusRows),
      bookingsByStatus: toCountMap(bookingsByStatusRows),
      foodsByCategory: toCountMap(foodsByCategoryRows, 'category'),
    },
    availableRooms: activeRooms,
    recentFoodItems: latestFoodItems,
    recentMenus: (latestMenus || []).map((m) => ({
      id: m.id,
      menu_date: m.menu_date,
      meal_slot: m.meal_slot,
      source_type: m.source_type,
      dishes: (m.menu_items || []).map((x) => x.food_item).filter(Boolean),
    })),
    recentIssues: (latestTickets || []).map((t) => ({
      id: t.id,
      booking_id: t.booking_id,
      status: t.status,
      description: t.description,
      assigned_staff: t.assigned_staff?.name || null,
      created_at: t.created_at,
    })),
    recentFeedback: (latestFeedback || []).map((f) => ({
      id: f.id,
      booking_id: f.booking_id,
      feedback_type: f.feedback_type || 'Service',
      sentiment: f.sentiment || 'pending',
      comment: f.comment,
      customer: f.customer?.name || null,
      room: f.booking?.room ? { room_number: f.booking.room.room_number, type: f.booking.room.type } : null,
      created_at: f.created_at,
    })),
    recentMealOrders: (latestMealOrders || []).map((o) => ({
      id: o.id,
      order_code: o.order_code,
      booking_id: o.booking_id,
      order_date: o.order_date,
      meal_slot: o.meal_slot,
      serving_type: o.serving_type,
      status: o.status,
      total_amount: o.total_amount,
      customer: o.customer?.name || null,
      room: o.room?.room_number || null,
    })),
  };

  let userScopedContext = {};
  if (user?.id && user?.role === 'customer') {
    const [myBookings, myIssues, myFeedback, myMealOrders] = await Promise.all([
      db.Booking.findAll({
        where: { user_id: user.id },
        attributes: ['id', 'booking_id', 'room_id', 'check_in', 'check_out', 'status', 'payment_status', 'total_amount'],
        include: [{ model: db.Room, as: 'room', attributes: ['id', 'room_number', 'type', 'price', 'status'] }],
        order: [['id', 'DESC']],
        limit: 20,
      }),
      db.ServiceRequest.findAll({
        include: [{ model: db.Booking, as: 'booking', where: { user_id: user.id }, attributes: ['id', 'booking_id'] }],
        attributes: ['id', 'booking_id', 'status', 'description', 'created_at'],
        order: [['id', 'DESC']],
        limit: 20,
      }),
      db.Feedback.findAll({
        where: { user_id: user.id },
        attributes: ['id', 'booking_id', 'feedback_type', 'sentiment', 'comment', 'created_at'],
        include: [
          {
            model: db.Booking,
            as: 'booking',
            attributes: ['id', 'booking_id'],
            include: [{ model: db.Room, as: 'room', attributes: ['id', 'room_number', 'type'] }],
          },
        ],
        order: [['id', 'DESC']],
        limit: 20,
      }),
      db.MealOrder.findAll({
        where: { user_id: user.id },
        attributes: ['id', 'order_code', 'booking_id', 'room_id', 'order_date', 'meal_slot', 'serving_type', 'status', 'total_amount'],
        order: [['id', 'DESC']],
        limit: 20,
      }),
    ]);

    userScopedContext = {
      myBookings: myBookings.map((b) => ({
        id: b.id,
        booking_id: b.booking_id,
        check_in: b.check_in,
        check_out: b.check_out,
        status: b.status,
        payment_status: b.payment_status,
        total_amount: b.total_amount,
        room: b.room ? { room_number: b.room.room_number, type: b.room.type, price: b.room.price, status: b.room.status } : null,
      })),
      myIssues: myIssues.map((i) => ({
        id: i.id,
        booking_id: i.booking_id,
        status: i.status,
        description: i.description,
        created_at: i.created_at,
      })),
      myFeedback: myFeedback.map((f) => ({
        id: f.id,
        booking_id: f.booking_id,
        feedback_type: f.feedback_type,
        sentiment: f.sentiment,
        comment: f.comment,
        room: f.booking?.room ? { room_number: f.booking.room.room_number, type: f.booking.room.type } : null,
        created_at: f.created_at,
      })),
      myMealOrders: myMealOrders.map((o) => ({
        id: o.id,
        order_code: o.order_code,
        booking_id: o.booking_id,
        order_date: o.order_date,
        meal_slot: o.meal_slot,
        serving_type: o.serving_type,
        status: o.status,
        total_amount: o.total_amount,
      })),
    };
  }

  const scopeHint = {
    focus: {
      roomsAndBookings: wantsRooms,
      foodAndMeals: wantsFood,
      supportAndFeedback: wantsSupport,
    },
  };

  return {
    ...globalContext,
    ...scopeHint,
    userScope: userScopedContext,
  };
};

exports.smartRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const budget = Number(req.query.budget || 0);

    const history = await db.Booking.findAll({
      where: { user_id: userId },
      include: [{ model: db.Room, as: 'room' }],
      order: [['id', 'DESC']],
      limit: 10,
    });

    const preferredTypes = history.map((h) => h.room?.type).filter(Boolean);

    const where = { status: 'Available' };
    if (budget > 0) where.price = { [Op.lte]: budget };
    if (preferredTypes.length) where.type = { [Op.in]: [...new Set(preferredTypes)] };

    const rooms = await db.Room.findAll({ where, limit: 6, order: [['price', 'ASC']] });

    return res.json({
      recommendations: rooms,
      reason: 'Based on booking history and budget constraints',
    });
  } catch (error) {
    next(error);
  }
};

exports.chatbot = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const context = await buildAiContext(req.user, message);
    const reply = await chatAssistant(message, context);

    return res.json({ reply });
  } catch (error) {
    next(error);
  }
};

exports.revenuePrediction = async (req, res, next) => {
  try {
    const paidBookings = await db.Booking.findAll({
      attributes: ['total_amount'],
      where: { payment_status: 'Paid' },
      order: [['created_at', 'ASC']],
      raw: true,
    });

    const monthly = [];
    for (let i = 0; i < paidBookings.length; i += 10) {
      const chunk = paidBookings.slice(i, i + 10);
      monthly.push(chunk.reduce((sum, item) => sum + Number(item.total_amount), 0));
    }

    const predicted = predictRevenue(monthly);
    return res.json({ predicted_monthly_revenue: predicted, historicalBuckets: monthly });
  } catch (error) {
    next(error);
  }
};

exports.sentimentAnalysis = async (req, res, next) => {
  try {
    const { feedback_id } = req.body;
    const feedback = await db.Feedback.findByPk(feedback_id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    const sentiment = await sentimentFromText(feedback.comment);
    await feedback.update({ sentiment });

    return res.json({ message: 'Sentiment analyzed', feedback_id: feedback.id, sentiment });
  } catch (error) {
    next(error);
  }
};

exports.status = async (_req, res) => {
  return res.json(getAiProviderStatus());
};
