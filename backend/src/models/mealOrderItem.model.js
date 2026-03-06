module.exports = (sequelize, DataTypes) => {
  const mealOrderItem = sequelize.define(
    'meal_order_items',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      meal_order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      food_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      line_total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: 'meal_order_items',
      indexes: [{ fields: ['meal_order_id'] }, { fields: ['food_item_id'] }],
    }
  );

  return mealOrderItem;
};
