const { Sequelize } = require('sequelize');
const config = require('../config/config');
const path = require('path');

let sequelize;

async function connectDatabase() {
  if (config.DATABASE_URL) {
    // PostgreSQL
    sequelize = new Sequelize(config.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
    console.log('[DB] Using PostgreSQL database');
  } else {
    // SQLite fallback
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../database.sqlite'),
      logging: false
    });
    console.log('[DB] Using SQLite database');
  }

  try {
    await sequelize.authenticate();
    console.log('[DB] Database connection established successfully.');

    // Sync models
    await sequelize.sync({ alter: true });
    console.log('[DB] Database models synchronized.');
  } catch (error) {
    console.error('[DB] Unable to connect to database:', error.message);
    throw error;
  }
}

function getSequelize() {
  return sequelize;
}

module.exports = { connectDatabase, getSequelize };
