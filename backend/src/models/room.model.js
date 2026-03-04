module.exports = (sequelize, DataTypes) => {
  const room = sequelize.define(
    'rooms',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      room_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      type: {
        type: DataTypes.ENUM('Single', 'Double', 'Deluxe', 'Suite'),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Available', 'Occupied', 'Cleaning', 'Maintenance'),
        allowNull: false,
        defaultValue: 'Available',
      },
      description: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      amenities: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: 'rooms',
      indexes: [{ fields: ['room_number'] }, { fields: ['type'] }, { fields: ['price'] }, { fields: ['status'] }],
    }
  );

  return room;
};
