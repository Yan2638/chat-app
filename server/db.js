
require('dotenv').config();

const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: Number(process.env.DB_PORT) || 5432,
});

client.connect()
  .then(() => console.log('✅ Успешное подключение к PostgreSQL'))
  .catch((err) => console.error('❌ Ошибка подключения к БД:', err));

module.exports = client;
