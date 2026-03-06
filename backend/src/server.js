require('dotenv').config();
const app = require('./app');
const db = require('./models');
const fs = require('fs');
const { DataTypes } = require('sequelize');

const PORT = process.env.PORT || 5000;

const ensureFeedbackTypeColumn = async () => {
  const qi = db.sequelize.getQueryInterface();

  try {
    const table = await qi.describeTable('feedbacks');
    if (!table.feedback_type) {
      await qi.addColumn('feedbacks', 'feedback_type', {
        type: DataTypes.ENUM('Service', 'Cleanliness', 'Room', 'Food', 'Facilities', 'Other'),
        allowNull: false,
        defaultValue: 'Service',
      });
    }
  } catch (_error) {
    // Ignore when feedbacks table does not exist yet; sequelize.sync will create it.
  }
};

const start = async () => {
  try {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }

    await db.sequelize.authenticate();
    await ensureFeedbackTypeColumn();
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
