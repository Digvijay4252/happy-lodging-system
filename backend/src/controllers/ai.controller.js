const { Op } = require('sequelize');
const db = require('../models');
const { chatAssistant, sentimentFromText } = require('../services/ai.service');
const { predictRevenue } = require('../services/analytics.service');

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
    const rooms = await db.Room.findAll({ where: { status: 'Available' }, limit: 5, raw: true });
    const reply = await chatAssistant(message, { availableRooms: rooms });

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
