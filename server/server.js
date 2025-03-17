require('dotenv').config();
const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');
const { text } = require('stream/consumers');

const app = express();

app.use(cors({
  origin: ['http://localhost', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

client.connect()
  .then(() => console.log('Подключено к PostgreSQL'))
  .catch(err => console.error('Ошибка подключения:', err.stack));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:3000'],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

  const getParticipants = async (chatId) => {
    console.log('Запрос участников для чата с ID:', chatId);
  
    try {
      const result = await client.query(
        `SELECT sender_id, receiver_id FROM chats WHERE id = $1`,
        [chatId]
      );
  
      if (result.rows.length === 0) {
        console.error('Чат не найден для chatId:', chatId);
        throw new Error('Чат не найден');
      }
  
      const participants = result.rows[0];
      console.log('Получены участники чата:', participants);
  
      return participants;
    } catch (error) {
      console.error('Ошибка при получении участников чата:', error);
      throw error;
    }
  };
  
  socket.on('sendMessage', async ({ senderId, chatId, text }) => {
    console.log('Полученные данные:', { senderId, chatId, text });
  
    if (!senderId || !chatId || !text.trim()) return;
  
    try {
      const { sender_id, receiver_id } = await getParticipants(chatId);
      console.log('Участники чата:', { sender_id, receiver_id });
  
      if (![sender_id, receiver_id].includes(senderId)) {
        console.error('Пользователь не является участником чата');
        return;
      }
  
      const receiverId = senderId === sender_id ? receiver_id : sender_id;
      console.log('Отправитель:', senderId, 'Получатель:', receiverId);
  
      const result = await client.query(
        `INSERT INTO "messages" (sender_id, chat_id, text, timestamp) 
         VALUES ($1, $2, $3, NOW()) RETURNING *`,
        [senderId, chatId, text]
      );
  
      const savedMessage = result.rows[0];
      console.log('Сохраненное сообщение в базе данных:', savedMessage);
  
      const participants = [sender_id, receiver_id];
  
      participants.forEach(userId => {
        const recipientSocketId = users.get(userId); 
        if (recipientSocketId) {
          console.log(`Отправка сообщения для пользователя ${userId} с сокетом ${recipientSocketId}`);
          io.to(recipientSocketId).emit('receiveMessage', savedMessage); 
        } else {
          console.warn(`Нет активного сокета для пользователя ${userId}. Не удалось отправить сообщение.`);
        }
      });
  
    } catch (err) {
      console.error("Ошибка при сохранении сообщения:", err);
    }
  });
  
  socket.on('connect', (userId) => {
    console.log('Пользователь подключен:', userId);
    console.log('Текущие активные сокеты:', Array.from(users.entries()));
    users.set(userId, socket.id);
  });
  
  socket.on('disconnect', (userId) => {
    console.log('Пользователь отключен:', userId);
    console.log('Текущие активные сокеты после отключения:', Array.from(users.entries()));
    users.delete(userId);
  });


});

app.get('/users', async (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: 'Пользователь не авторизован' });
  }

  try {
    const userResult = await client.query('SELECT id FROM "users" WHERE auth_token = $1', [token]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Неверный токен' });
    }

    const result = await client.query('SELECT id, "Name", "Email" FROM "users"');

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ message: 'Ошибка при получении пользователей' });
  }
});

app.get('/messages/:chatId', async (req, res) => {
  const { chatId } = req.params;
  console.log('chatId:', chatId)
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Пользователь не авторизован" });
  }

  try {
    const userResult = await client.query('SELECT id FROM "users" WHERE auth_token = $1', [token]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Неверный токен" });
    }

    const userId = userResult.rows[0].id;

    const result = await client.query(
      `SELECT m.id, m.text, m.chat_id, m.sender_id, u."Name" AS sender_name
       FROM "messages" m
       JOIN "users" u ON m.sender_id = u.id
       WHERE m.chat_id = $1
       ORDER BY m.timestamp ASC`, 
      [chatId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка при загрузке сообщений:", error);
    res.status(500).json({ message: "Ошибка при загрузке сообщений" });
  }
});


app.post('/messages', async (req, res) => {
  const { text, chatId, senderId } = req.body;
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: 'Пользователь не авторизован' });
  }

  try {
    const userResult = await client.query('SELECT id FROM "users" WHERE auth_token = $1', [token]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Неверный токен' });
    }

    const userId = userResult.rows[0].id;

    const result = await client.query(
      `INSERT INTO "messages" (sender_id, chat_id, text) 
       VALUES ($1, $2, $3) RETURNING id`,
      [senderId, chatId, text]
    );

    res.status(201).json({ message: 'Сообщение успешно отправлено', messageId: result.rows[0].id });
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);
    res.status(500).json({ message: "Ошибка при отправке сообщения" });
  }
});




app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Все поля обязательны!" });
  }

  try {
    const result = await client.query(
      `INSERT INTO "users" ("Name", "Email", "Password") VALUES ($1, $2, $3) RETURNING *`,
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
      'SELECT "id", "Name", "Email", "Password" FROM "users" WHERE "Email" = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Неверный email или пароль!" });
    }

    const user = result.rows[0];

    if (password !== user.Password) {
      return res.status(401).json({ error: "Неверный email или пароль!" });
    }

    const token = crypto.randomBytes(64).toString('hex');

    await client.query(
      'UPDATE "users" SET auth_token = $1 WHERE id = $2',
      [token, user.id]
    );

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

app.post('/logout', async (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(400).json({ error: 'Токен не найден' });
  }

  try {
    res.clearCookie('auth_token');

    res.json({ message: 'Выход выполнен успешно' });
  } catch (err) {
    console.error("Ошибка при выходе:", err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


app.post('/createChat', async (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: 'Пользователь не авторизован' });
  }

  try {
    const userResult = await client.query('SELECT id FROM "users" WHERE auth_token = $1', [token]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Неверный токен' });
    }

    const senderId = userResult.rows[0].id;
    let { userId2 } = req.body;

    userId2 = parseInt(userId2, 10);
    if (!userId2 || isNaN(userId2) || senderId === userId2) {
      return res.status(400).json({ message: 'Невозможно создать чат с самим собой или неверный ID' });
    }

    const userExists = await client.query('SELECT id FROM "users" WHERE id = $1', [userId2]);

    if (userExists.rows.length === 0) {
      return res.status(400).json({ message: 'Пользователь с таким ID не найден' });
    }

    const existingChat = await client.query(
      `SELECT * FROM chats WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)`,
      [senderId, userId2]
    );

    if (existingChat.rows.length > 0) {
      return res.status(400).json({ message: 'Чат с таким пользователем уже существует' });
    }

    const result = await client.query(
      'INSERT INTO chats (name, sender_id, receiver_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [`Чат ${senderId} - ${userId2}`, senderId, userId2]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при создании чата:', error);
    res.status(500).json({ message: 'Ошибка при создании чата' });
  }
});

app.get('/chat-app/chat/:chatId', async (req, res) => {
  const chatId = req.params.id;
  const token = req.cookies.auth_token;
  
  console.log('Cookies:', req.cookies); 
  console.log('Auth token:', req.cookies.auth_token);
  if (!token) {
    return res.status(401).json({ message: "Пользователь не авторизован" });
  }

  try {
    const userResult = await client.query('SELECT id FROM "users" WHERE auth_token = $1', [token]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Неверный токен" });
    }

    const messages = await client.query(
      `SELECT m.text, u."Name" AS sender_name
       FROM "messages" m
       JOIN "users" u ON m.sender_id = u.id
       WHERE m.chat_id = $1 ORDER BY m.timestamp ASC`,
      [chatId]
    );
    res.json(messages.rows);
  } catch (error) {
    console.error("Ошибка при загрузке сообщений:", error);
    res.status(500).json({ message: "Ошибка при загрузке сообщений" });
  }
});



app.get('/chats', async (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: 'Пользователь не авторизован' });
  }

  try {
    const userResult = await client.query(
      'SELECT id FROM "users" WHERE auth_token = $1', 
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Неверный токен' });
    }

    const userId = userResult.rows[0].id;

    const result = await client.query(
      `SELECT c.id, c.name, 
              u1."Name" AS sender_name, 
              u2."Name" AS receiver_name,
              (SELECT text FROM "messages" m WHERE m.chat_id = c.id ORDER BY m.timestamp DESC LIMIT 1) AS last_message,
              (SELECT timestamp FROM "messages" m WHERE m.chat_id = c.id ORDER BY m.timestamp DESC LIMIT 1) AS last_message_time
       FROM "chats" c
       JOIN "users" u1 ON c.sender_id = u1.id
       JOIN "users" u2 ON c.receiver_id = u2.id
       WHERE c.sender_id = $1 OR c.receiver_id = $1
       ORDER BY last_message_time DESC NULLS LAST`,
      [userId]
    );

    console.log('Чаты для пользователя:', result.rows);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении чатов:', error);
    res.status(500).json({ message: 'Ошибка при получении чатов' });
  }
});



app.get('/auth-check', async (req, res) => {
  const token = req.cookies.auth_token;
  
  if (token) {
    try {
      const result = await client.query(
        `SELECT id, "Name", "Email" FROM "users" WHERE "auth_token" = $1`,
        [token]
      );
      
      if (result.rows.length > 0) {
        const user = result.rows[0];  
        res.status(200).json({ user });  
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
