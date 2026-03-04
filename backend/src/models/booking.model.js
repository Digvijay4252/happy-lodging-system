module.exports = (sequelize, DataTypes) => {
  const booking = sequelize.define(
    'bookings',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      booking_id: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      check_in: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      check_out: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Booked', 'CheckedIn', 'CheckedOut', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Booked',
      },
      payment_status: {
        type: DataTypes.ENUM('Pending', 'Paid', 'Failed'),
        allowNull: false,
        defaultValue: 'Pending',
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: 'bookings',
      indexes: [{ fields: ['user_id'] }, { fields: ['room_id'] }, { fields: ['status'] }, { fields: ['check_in'] }],
    }
  );

  return booking;
};
