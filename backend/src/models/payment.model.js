module.exports = (sequelize, DataTypes) => {
  const payment = sequelize.define(
    'payments',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.STRING(80),
        allowNull: false,
        unique: true,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Paid', 'Failed'),
        allowNull: false,
        defaultValue: 'Pending',
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: 'payments',
      indexes: [{ fields: ['booking_id'] }, { fields: ['transaction_id'] }, { fields: ['status'] }],
    }
  );

  return payment;
};
