const client = require('../db');

exports.createChat = async (req, res) => {
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
};

exports.getChats = async (req, res) => {
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

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении чатов:', error);
    res.status(500).json({ message: 'Ошибка при получении чатов' });
  }
};

exports.getChatMessages = async (req, res) => {
  const { chatId } = req.params;

  if (!chatId || isNaN(parseInt(chatId))) {
    return res.status(400).json({ message: 'Некорректный chatId' });
  }

  try {
    const result = await client.query(
      `SELECT m.id, m.text, m.chat_id, m.sender_id, u."Name" AS sender_name
       FROM "messages" m
       JOIN "users" u ON m.sender_id = u.id
       WHERE m.chat_id = $1
       ORDER BY m.timestamp ASC`,
      [parseInt(chatId)]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка при загрузке сообщений:", error);
    res.status(500).json({ message: "Ошибка при загрузке сообщений" });
  }
};


