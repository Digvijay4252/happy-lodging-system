module.exports = (sequelize, DataTypes) => {
  const roomImage = sequelize.define(
    'room_images',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      image_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: 'room_images',
      indexes: [{ fields: ['room_id'] }],
    }
  );

  return roomImage;
};
