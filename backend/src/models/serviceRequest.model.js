module.exports = (sequelize, DataTypes) => {
  const serviceRequest = sequelize.define(
    'service_requests',
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
      description: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Open', 'InProgress', 'Resolved', 'Closed'),
        allowNull: false,
        defaultValue: 'Open',
      },
      assigned_staff_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: 'service_requests',
      indexes: [{ fields: ['booking_id'] }, { fields: ['status'] }, { fields: ['assigned_staff_id'] }],
    }
  );

  return serviceRequest;
};
