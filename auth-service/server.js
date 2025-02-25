require('dotenv').config();
const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET, PUT, POST, DELETE",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser()); 

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect()
  .then(() => console.log('Подключено к PostgreSQL'))
  .catch(err => console.error('Ошибка подключения', err.stack));

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Все поля обязательны!" });
  }

  try {
    const result = await client.query(
      `INSERT INTO "Registration" ("Name", "Email", "Password") VALUES ($1, $2, $3) RETURNING *`,
      [username, email, password]
    );

    const user = result.rows[0];

    res.cookie('auth_token', 'some_generated_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000,
    });

    res.status(201).json({ message: "Регистрация успешна!", user: user });
  } catch (err) {
    console.error("Ошибка при регистрации:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Все поля обязательны!" });
  }

  try {
    const result = await client.query(
      `SELECT * FROM "Registration" WHERE "Email" = $1 AND "Password" = $2`,
      [email, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];

      res.cookie('auth_token', 'some_generated_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000,
      });

      res.status(200).json({ message: "Авторизация успешна!", user: user });
    } else {
      res.status(401).json({ error: "Неверный email или пароль!" });
    }
  } catch (err) {
    console.error("Ошибка при логине:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.get('/auth-check', (req, res) => {
  const token = req.cookies.auth_token;

  if (token) {
    res.status(200).json({ message: "Пользователь авторизован" });
  } else {
    res.status(401).json({ error: "Пользователь не авторизован" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Сервер работает на http://localhost:${port}`);
});
