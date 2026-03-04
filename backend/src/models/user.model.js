module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(160),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('admin', 'staff', 'customer'),
        allowNull: false,
        defaultValue: 'customer',
      },
      status: {
        type: DataTypes.ENUM('active', 'blocked'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: 'users',
      indexes: [{ fields: ['email'] }, { fields: ['role'] }, { fields: ['status'] }],
    }
  );

  return user;
};
