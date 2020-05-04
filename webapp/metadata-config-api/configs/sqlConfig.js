// @ts-check
const env = require('dotenv').config();

const sqlConfig = {
  user: process.env.DBUser,
  password: process.env.Password,
  server: process.env.MetaConfigDBServer,
  database: process.env.MetaConfigDB,
  connectionTimeout: 60000,
  options: {
    encrypt: true
  }
};

module.exports = sqlConfig;