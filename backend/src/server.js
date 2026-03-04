require('dotenv').config();
const app = require('./app');
const db = require('./models');
const fs = require('fs');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }

    await db.sequelize.authenticate();
    await db.sequelize.sync({ alter: false });
    console.log('Database connected and synced');

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    const details =
      error?.message ||
      error?.original?.sqlMessage ||
      error?.parent?.sqlMessage ||
      JSON.stringify(error);
    console.error('Unable to start server:', details);
    if (error?.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
};

start();
