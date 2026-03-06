const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../models');

const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner'];
const SERVING_TYPES = ['DineIn', 'Takeaway', 'RoomDelivery'];
const ORDER_STATUSES = ['Placed', 'Preparing', 'Delivered', 'Cancelled'];

const toDateOnly = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const ensureMenuForDateAndSlot = async (menuDate, mealSlot, actorId) => {
  const normalizedDate = toDateOnly(menuDate);
  if (!normalizedDate) return null;
  if (!MEAL_SLOTS.includes(mealSlot)) return null;

  let menu = await db.DailyMealMenu.findOne({
    where: { menu_date: normalizedDate, meal_slot: mealSlot },
    include: [{ model: db.DailyMealMenuItem, as: 'menu_items', include: [{ model: db.FoodItem, as: 'food_item' }] }],
  });
  if (menu) return menu;

  const prevDate = new Date(`${normalizedDate}T00:00:00`);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevDateStr = prevDate.toISOString().slice(0, 10);

  const prevMenu = await db.DailyMealMenu.findOne({
    where: { menu_date: prevDateStr, meal_slot: mealSlot },
    include: [{ model: db.DailyMealMenuItem, as: 'menu_items' }],
  });
  if (!prevMenu || !prevMenu.menu_items?.length) return null;

  const tx = await db.sequelize.transaction();
  try {
    const created = await db.DailyMealMenu.create(
      {
        menu_date: normalizedDate,
        meal_slot: mealSlot,
        source_type: 'AutoCarryForward',
        created_by: actorId || prevMenu.created_by || 1,
      },
      { transaction: tx }
    );

    for (const item of prevMenu.menu_items) {
      await db.DailyMealMenuItem.create(
        { daily_menu_id: created.id, food_item_id: item.food_item_id },
        { transaction: tx }
      );
    }

    await tx.commit();
  } catch (error) {
    await tx.rollback();
    throw error;
  }

  menu = await db.DailyMealMenu.findOne({
    where: { menu_date: normalizedDate, meal_slot: mealSlot },
    include: [{ model: db.DailyMealMenuItem, as: 'menu_items', include: [{ model: db.FoodItem, as: 'food_item' }] }],
  });
  return menu;
};

exports.listFoodItems = async (req, res, next) => {
  try {
    const { q, category, activeOnly } = req.query;
    const where = {};
    if (category) where.category = category;
    if (activeOnly === 'true') where.is_active = true;
    if (q) {
      where[Op.or] = [{ name: { [Op.like]: `%${q}%` } }, { description: { [Op.like]: `%${q}%` } }];
    }

    const items = await db.FoodItem.findAll({ where, order: [['id', 'DESC']] });
    return res.json({ items });
  } catch (error) {
    next(error);
  }
};

exports.createFoodItem = async (req, res, next) => {
  try {
    const { name, description, category, price, image_url, is_active } = req.body;
    if (!name || !category || price === undefined) {
      return res.status(400).json({ message: 'name, category, and price are required' });
    }

    const item = await db.FoodItem.create({
      name,
      description: description || null,
      category,
      price,
      image_url: image_url || null,
      is_active: is_active !== false,
      created_by: req.user.id,
    });

    return res.status(201).json({ message: 'Food item created', item });
  } catch (error) {
    next(error);
  }
};

exports.updateFoodItem = async (req, res, next) => {
  try {
    const item = await db.FoodItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Food item not found' });

    const { name, description, category, price, image_url, is_active } = req.body;
    await item.update({
      name: name ?? item.name,
      description: description ?? item.description,
      category: category ?? item.category,
      price: price ?? item.price,
      image_url: image_url ?? item.image_url,
      is_active: is_active ?? item.is_active,
    });

    return res.json({ message: 'Food item updated', item });
  } catch (error) {
    next(error);
  }
};

exports.deleteFoodItem = async (req, res, next) => {
  try {
    const item = await db.FoodItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Food item not found' });
    await item.destroy();
    return res.json({ message: 'Food item deleted' });
  } catch (error) {
    next(error);
  }
};

exports.addFoodItemImage = async (req, res, next) => {
  try {
    const item = await db.FoodItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Food item not found' });

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;
    if (!imageUrl) return res.status(400).json({ message: 'Image is required' });

    await item.update({ image_url: imageUrl });
    return res.json({ message: 'Food image updated', item });
  } catch (error) {
    next(error);
  }
};

exports.upsertDailyMenu = async (req, res, next) => {
  try {
    const { menu_date, meal_slot, food_item_ids } = req.body;
    const normalizedDate = toDateOnly(menu_date);
    if (!normalizedDate || !MEAL_SLOTS.includes(meal_slot)) {
      return res.status(400).json({ message: 'Valid menu_date and meal_slot are required' });
    }
    if (!Array.isArray(food_item_ids) || !food_item_ids.length) {
      return res.status(400).json({ message: 'food_item_ids must be a non-empty array' });
    }

    const uniqueFoodIds = [...new Set(food_item_ids.map(Number).filter((id) => !Number.isNaN(id)))];
    const activeItems = await db.FoodItem.findAll({
      where: { id: { [Op.in]: uniqueFoodIds }, is_active: true },
      attributes: ['id'],
      raw: true,
    });
    if (activeItems.length !== uniqueFoodIds.length) {
      return res.status(400).json({ message: 'Some food items are invalid or inactive' });
    }

    const tx = await db.sequelize.transaction();
    let menu;
    try {
      menu = await db.DailyMealMenu.findOne({
        where: { menu_date: normalizedDate, meal_slot },
        transaction: tx,
      });

      if (!menu) {
        menu = await db.DailyMealMenu.create(
          {
            menu_date: normalizedDate,
            meal_slot,
            source_type: 'Manual',
            created_by: req.user.id,
          },
          { transaction: tx }
        );
      } else {
        await menu.update({ source_type: 'Manual', created_by: req.user.id }, { transaction: tx });
      }

      await db.DailyMealMenuItem.destroy({ where: { daily_menu_id: menu.id }, transaction: tx });
      await db.DailyMealMenuItem.bulkCreate(
        uniqueFoodIds.map((foodId) => ({ daily_menu_id: menu.id, food_item_id: foodId })),
        { transaction: tx }
      );

      await tx.commit();
    } catch (error) {
      await tx.rollback();
      throw error;
    }

    const fullMenu = await db.DailyMealMenu.findByPk(menu.id, {
      include: [{ model: db.DailyMealMenuItem, as: 'menu_items', include: [{ model: db.FoodItem, as: 'food_item' }] }],
    });
    return res.json({ message: 'Daily menu saved', menu: fullMenu });
  } catch (error) {
    next(error);
  }
};

exports.getMenuForDateSlot = async (req, res, next) => {
  try {
    const menu_date = req.query.menu_date || req.body.menu_date;
    const meal_slot = req.query.meal_slot || req.body.meal_slot;
    const normalizedDate = toDateOnly(menu_date);
    if (!normalizedDate || !MEAL_SLOTS.includes(meal_slot)) {
      return res.status(400).json({ message: 'Valid menu_date and meal_slot are required' });
    }

    const menu = await ensureMenuForDateAndSlot(normalizedDate, meal_slot, req.user?.id);
    if (!menu) {
      return res.json({ menu: null, items: [], message: 'No menu configured for this date and slot' });
    }

    const items = (menu.menu_items || [])
      .map((m) => m.food_item)
      .filter((it) => !!it && it.is_active)
      .map((it) => ({
        id: it.id,
        name: it.name,
        description: it.description,
        category: it.category,
        price: it.price,
        image_url: it.image_url,
      }));

    return res.json({ menu, items });
  } catch (error) {
    next(error);
  }
};

exports.listDailyMenus = async (req, res, next) => {
  try {
    const { date_from, date_to, meal_slot } = req.query;
    const where = {};
    if (meal_slot && MEAL_SLOTS.includes(meal_slot)) where.meal_slot = meal_slot;
    if (date_from || date_to) {
      where.menu_date = {};
      if (date_from) where.menu_date[Op.gte] = toDateOnly(date_from);
      if (date_to) where.menu_date[Op.lte] = toDateOnly(date_to);
    }

    const menus = await db.DailyMealMenu.findAll({
      where,
      include: [{ model: db.DailyMealMenuItem, as: 'menu_items', include: [{ model: db.FoodItem, as: 'food_item' }] }],
      order: [['menu_date', 'DESC'], ['meal_slot', 'ASC']],
    });
    return res.json({ menus });
  } catch (error) {
    next(error);
  }
};

exports.carryForwardForDate = async (req, res, next) => {
  try {
    const targetDate = toDateOnly(req.body.menu_date || req.query.menu_date || new Date());
    if (!targetDate) return res.status(400).json({ message: 'Valid menu_date is required' });

    const results = [];
    for (const slot of MEAL_SLOTS) {
      const existing = await db.DailyMealMenu.findOne({ where: { menu_date: targetDate, meal_slot: slot } });
      if (existing) {
        results.push({ meal_slot: slot, status: 'exists' });
        continue;
      }
      const created = await ensureMenuForDateAndSlot(targetDate, slot, req.user.id);
      results.push({ meal_slot: slot, status: created ? 'carried_forward' : 'missing_previous_menu' });
    }

    return res.json({ message: 'Carry-forward completed', date: targetDate, results });
  } catch (error) {
    next(error);
  }
};

exports.placeMealOrder = async (req, res, next) => {
  try {
    const { booking_id, order_date, meal_slot, serving_type, items, notes } = req.body;
    const normalizedDate = toDateOnly(order_date);
    if (!booking_id || !normalizedDate || !MEAL_SLOTS.includes(meal_slot) || !SERVING_TYPES.includes(serving_type)) {
      return res.status(400).json({ message: 'booking_id, order_date, meal_slot, and serving_type are required' });
    }
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: 'items must be a non-empty array' });
    }

    const booking = await db.Booking.findOne({
      where: { id: booking_id, user_id: req.user.id },
      include: [{ model: db.Room, as: 'room' }],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found for current customer' });
    if (['Cancelled', 'CheckedOut'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot place meal order for cancelled or checked-out booking' });
    }

    const orderDateObj = new Date(`${normalizedDate}T00:00:00`);
    const checkInObj = new Date(`${booking.check_in}T00:00:00`);
    const checkOutObj = new Date(`${booking.check_out}T00:00:00`);
    if (orderDateObj < checkInObj || orderDateObj > checkOutObj) {
      return res.status(400).json({ message: 'Meal can be booked only within your booking dates' });
    }

    const menu = await ensureMenuForDateAndSlot(normalizedDate, meal_slot, req.user.id);
    if (!menu) return res.status(400).json({ message: 'No menu available for selected date and slot' });

    const menuItemRows = await db.DailyMealMenuItem.findAll({
      where: { daily_menu_id: menu.id },
      attributes: ['food_item_id'],
      raw: true,
    });
    const allowedFoodIds = new Set(menuItemRows.map((r) => Number(r.food_item_id)));
    if (!allowedFoodIds.size) return res.status(400).json({ message: 'Selected menu has no dishes' });

    const requested = items
      .map((it) => ({ food_item_id: Number(it.food_item_id), qty: Number(it.qty || 0) }))
      .filter((it) => !Number.isNaN(it.food_item_id) && it.qty > 0);
    if (!requested.length) return res.status(400).json({ message: 'At least one dish with qty > 0 is required' });

    for (const it of requested) {
      if (!allowedFoodIds.has(it.food_item_id)) {
        return res.status(400).json({ message: 'Some selected dishes are not available for selected menu' });
      }
    }

    const foodRows = await db.FoodItem.findAll({
      where: { id: { [Op.in]: requested.map((r) => r.food_item_id) }, is_active: true },
      raw: true,
    });
    const foodMap = new Map(foodRows.map((f) => [Number(f.id), f]));
    if (foodRows.length !== requested.length) {
      return res.status(400).json({ message: 'Some selected dishes are invalid or inactive' });
    }

    const tx = await db.sequelize.transaction();
    let order;
    try {
      const orderItemsPayload = requested.map((r) => {
        const food = foodMap.get(r.food_item_id);
        const unitPrice = Number(food.price);
        return {
          food_item_id: r.food_item_id,
          qty: r.qty,
          unit_price: unitPrice,
          line_total: Number((unitPrice * r.qty).toFixed(2)),
        };
      });
      const total = orderItemsPayload.reduce((sum, i) => sum + Number(i.line_total), 0);

      order = await db.MealOrder.create(
        {
          order_code: `MEL-${uuidv4().split('-')[0].toUpperCase()}`,
          user_id: req.user.id,
          booking_id: booking.id,
          room_id: booking.room_id,
          order_date: normalizedDate,
          meal_slot,
          serving_type,
          total_amount: Number(total.toFixed(2)),
          status: 'Placed',
          notes: notes || null,
        },
        { transaction: tx }
      );

      await db.MealOrderItem.bulkCreate(
        orderItemsPayload.map((i) => ({ ...i, meal_order_id: order.id })),
        { transaction: tx }
      );
      await tx.commit();
    } catch (error) {
      await tx.rollback();
      throw error;
    }

    const fullOrder = await db.MealOrder.findByPk(order.id, {
      include: [
        { model: db.MealOrderItem, as: 'order_items', include: [{ model: db.FoodItem, as: 'food_item' }] },
        { model: db.Booking, as: 'booking' },
        { model: db.Room, as: 'room', attributes: ['id', 'room_number', 'type'] },
      ],
    });

    return res.status(201).json({ message: 'Meal order placed', order: fullOrder });
  } catch (error) {
    next(error);
  }
};

exports.getMyMealOrders = async (req, res, next) => {
  try {
    const { booking_id, status } = req.query;
    const where = { user_id: req.user.id };
    if (booking_id) where.booking_id = Number(booking_id);
    if (status && ORDER_STATUSES.includes(status)) where.status = status;

    const orders = await db.MealOrder.findAll({
      where,
      include: [
        { model: db.MealOrderItem, as: 'order_items', include: [{ model: db.FoodItem, as: 'food_item' }] },
        { model: db.Booking, as: 'booking' },
        { model: db.Room, as: 'room', attributes: ['id', 'room_number', 'type'] },
      ],
      order: [['id', 'DESC']],
    });

    return res.json({ orders });
  } catch (error) {
    next(error);
  }
};

exports.cancelMyMealOrder = async (req, res, next) => {
  try {
    const order = await db.MealOrder.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!order) return res.status(404).json({ message: 'Meal order not found' });
    if (order.status === 'Delivered') return res.status(400).json({ message: 'Delivered order cannot be cancelled' });
    if (order.status === 'Cancelled') return res.status(400).json({ message: 'Order already cancelled' });

    await order.update({ status: 'Cancelled' });
    return res.json({ message: 'Meal order cancelled', order });
  } catch (error) {
    next(error);
  }
};

exports.listMealOrders = async (req, res, next) => {
  try {
    const { q, status, order_date, serving_type } = req.query;
    const where = {};
    if (status && ORDER_STATUSES.includes(status)) where.status = status;
    if (order_date) where.order_date = toDateOnly(order_date);
    if (serving_type && SERVING_TYPES.includes(serving_type)) where.serving_type = serving_type;

    const orders = await db.MealOrder.findAll({
      where,
      include: [
        { model: db.MealOrderItem, as: 'order_items', include: [{ model: db.FoodItem, as: 'food_item' }] },
        { model: db.User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: db.Booking, as: 'booking' },
        { model: db.Room, as: 'room', attributes: ['id', 'room_number', 'type'] },
      ],
      order: [['id', 'DESC']],
    });

    const filtered = q
      ? orders.filter((o) => {
          const s = String(q).toLowerCase();
          return (
            String(o.order_code || '')
              .toLowerCase()
              .includes(s) ||
            String(o.customer?.name || '')
              .toLowerCase()
              .includes(s) ||
            String(o.booking?.booking_id || '')
              .toLowerCase()
              .includes(s) ||
            String(o.room?.room_number || '')
              .toLowerCase()
              .includes(s)
          );
        })
      : orders;

    return res.json({ orders: filtered });
  } catch (error) {
    next(error);
  }
};

exports.updateMealOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid meal order status' });
    }

    const order = await db.MealOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Meal order not found' });
    await order.update({ status });
    return res.json({ message: 'Meal order status updated', order });
  } catch (error) {
    next(error);
  }
};
