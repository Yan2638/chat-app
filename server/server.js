require('dotenv').config();
const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto')

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET, POST, PUT, DELETE ",
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
  .catch(err => console.error('Ошибка подключения:', err.stack));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  }
});

const users = new Map();

io.on('connection', (socket) => {
  console.log('Новый клиент подключился:', socket.id);

  socket.on('authenticate', async (userId) => {
    if (!userId) return;
    users.set(userId, socket.id);
    console.log(`Пользователь ${userId} подключился к чату`);
  });

  socket.on('sendMessage', async ({senderId, text}) => {
    console.log('Полученные данные:', { senderId, text }); // Логируем данные перед запросом
  
    if (!senderId || !text.trim()) return; // Используем text вместо message
  
    const newMessage = {
      sender_id: senderId,
      text, // Здесь используется text
      timestamp: new Date(),
    };
  
    try {
      const result = await client.query(
        `INSERT INTO "messages" ("sender_id", "text", "timestamp") 
         VALUES ($1, $2, NOW()) RETURNING *`,
        [senderId, text] // Здесь тоже используем text вместо message
      );
      const savedMessage = result.rows[0];
      io.emit('receiveMessage', savedMessage); // Отправляем сохраненное сообщение
    } catch (err) {
      console.error('Ошибка при сохранении сообщения:', err);
    }
  });
  

  socket.on('disconnect', () => {
    for (let [userId, socketId] of users) {
      if (socketId === socket.id) {
        users.delete(userId);
        console.log(`Пользователь ${userId} отключился`);
        break;
      }
    }
  });
});

app.get('/messages', async (req, res) => {
  try {
    const result = await client.query(
      `SELECT "messages".*, "Registration"."Name" 
       FROM "messages"
       JOIN "Registration" ON "messages"."sender_id" = "Registration"."id"
       ORDER BY "timestamp" ASC`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении сообщений:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


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
    // Ищем пользователя в базе
    const result = await client.query(
      'SELECT id, "Name", "Email", "Password" FROM "Registration" WHERE "Email" = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Неверный email или пароль!" });
    }

    const user = result.rows[0];

    // Простая проверка пароля (так делать небезопасно!)
    if (password !== user.Password) {
      return res.status(401).json({ error: "Неверный email или пароль!" });
    }

    // Генерируем случайный токен
    const token = crypto.randomBytes(64).toString('hex');

    // Записываем токен в базу
    await client.query(
      'UPDATE "Registration" SET auth_token = $1 WHERE id = $2',
      [token, user.id]
    );

    // Устанавливаем токен в cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000, // 1 час
    });

    res.status(200).json({ message: "Авторизация успешна!", user });
  } catch (err) {
    console.error("Ошибка при логине:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});




app.get('/auth-check', async (req, res) => {
  const token = req.cookies.auth_token;
  
  if (token) {
    try {
      // Здесь мы будем искать пользователя в базе данных по токену
      const result = await client.query(
        `SELECT id, "Name", "Email" FROM "Registration" WHERE "auth_token" = $1`,
        [token]
      );
      
      if (result.rows.length > 0) {
        const user = result.rows[0];  // Извлекаем первого пользователя, найденного по токену
        res.status(200).json({ user });  // Возвращаем информацию о пользователе
      } else {
        res.status(401).json({ error: "Не найден пользователь с таким токеном" });
      }
    } catch (error) {
      console.error('Ошибка при проверке авторизации:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  } else {
    res.status(401).json({ error: "Пользователь не авторизован" });
  }
});


module.exports = app;

const port = 3000;
server.listen(port, () => {
  console.log(`РАКЕТА НА ВЗЛЕТ! http://localhost:${port}`);
});
