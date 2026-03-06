module.exports = (sequelize, DataTypes) => {
  const feedback = sequelize.define(
    'feedbacks',
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
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comment: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      feedback_type: {
        type: DataTypes.ENUM('Service', 'Cleanliness', 'Room', 'Food', 'Facilities', 'Other'),
        allowNull: false,
        defaultValue: 'Service',
      },
      sentiment: {
        type: DataTypes.ENUM('positive', 'neutral', 'negative'),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: 'feedbacks',
      indexes: [{ fields: ['booking_id'] }, { fields: ['user_id'] }, { fields: ['sentiment'] }, { fields: ['feedback_type'] }],
    }
  );

  return feedback;
};
