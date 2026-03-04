const { Sequelize } = require('sequelize');

const dbName = process.env.DB_NAME || 'happy_lodging';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = Number(process.env.DB_PORT || 3306);

const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPassword,
  {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
    define: {
      freezeTableName: true,
      timestamps: true,
      underscored: true,
    },
  }
);

module.exports = sequelize;
