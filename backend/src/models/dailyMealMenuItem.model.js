module.exports = (sequelize, DataTypes) => {
  const dailyMealMenuItem = sequelize.define(
    'daily_meal_menu_items',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      daily_menu_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      food_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: 'daily_meal_menu_items',
      indexes: [{ unique: true, fields: ['daily_menu_id', 'food_item_id'] }, { fields: ['food_item_id'] }],
    }
  );

  return dailyMealMenuItem;
};
