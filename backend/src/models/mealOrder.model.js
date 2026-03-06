module.exports = (sequelize, DataTypes) => {
  const mealOrder = sequelize.define(
    'meal_orders',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      order_code: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      order_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      meal_slot: {
        type: DataTypes.ENUM('Breakfast', 'Lunch', 'Dinner'),
        allowNull: false,
      },
      serving_type: {
        type: DataTypes.ENUM('DineIn', 'Takeaway', 'RoomDelivery'),
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Placed', 'Preparing', 'Delivered', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Placed',
      },
      notes: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: 'meal_orders',
      indexes: [{ fields: ['order_code'] }, { fields: ['user_id'] }, { fields: ['booking_id'] }, { fields: ['order_date'] }],
    }
  );

  return mealOrder;
};
