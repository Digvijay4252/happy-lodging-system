module.exports = (sequelize, DataTypes) => {
  const dailyMealMenu = sequelize.define(
    'daily_meal_menus',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      menu_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      meal_slot: {
        type: DataTypes.ENUM('Breakfast', 'Lunch', 'Dinner'),
        allowNull: false,
      },
      source_type: {
        type: DataTypes.ENUM('Manual', 'AutoCarryForward'),
        allowNull: false,
        defaultValue: 'Manual',
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: 'daily_meal_menus',
      indexes: [{ unique: true, fields: ['menu_date', 'meal_slot'] }, { fields: ['meal_slot'] }],
    }
  );

  return dailyMealMenu;
};
