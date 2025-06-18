const { Server } = require('socket.io');
const client = require('../db');

module.exports = function (server) {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const users = new Map();

const fetch = require('node-fetch');

async function generateAIResponse(userMessage, senderId) {
  try {
    const response = await fetch('http://localhost:3000/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: [],
        newMessage: userMessage
      }),
    });

    const data = await response.json();
    return data.reply || '[Ошибка AI]';
  } catch (error) {
    console.error('Ошибка общения с AI:', error);
    return '[Ошибка AI]';
  }
}


  io.on('connection', (socket) => {
    console.log('Пользователь подключен:', socket.id);

    socket.on('authenticate', (userId) => {
      users.set(userId, socket.id);
      console.log(`✅ Аутентифицирован пользователь ${userId}`);
    });

    const getParticipants = async (chatId) => {
      const result = await client.query(
        'SELECT sender_id, receiver_id FROM chats WHERE id = $1',
        [chatId]
      );
      return result.rows[0];
    };

    // Обработка входящего сообщения
    socket.on('sendMessage', async ({ senderId, chatId, text }) => {
      if (!senderId || !chatId || !text || !text.trim()) return;

          if (chatId === 'ai-chat') {
    const aiReply = await generateAIResponse(text, senderId);

    io.to(socket.id).emit('receiveMessage', {
      sender_id: 'ai',
      chat_id: 'ai-chat',
      text: aiReply,
      sender_name: 'AI-ассистент',
      timestamp: new Date()
    });

    return; // ⛔ не обрабатываем как обычный чат
  }
      
      try {
        const numericChatId = parseInt(chatId, 10); // ✅ обязательно!
        const { sender_id, receiver_id } = await getParticipants(numericChatId);
        const receiverId = senderId === sender_id ? receiver_id : sender_id;

        // Сохраняем сообщение в базу данных
        const result = await client.query(
          `INSERT INTO messages (sender_id, chat_id, text, timestamp)
           VALUES ($1, $2, $3, NOW())
           RETURNING *`,
          [senderId, chatId, text]
        );

        const savedMessage = result.rows[0];

        // Отправляем сообщение обоим участникам чата
        [senderId, receiverId].forEach(userId => {
          const socketId = users.get(userId);
          if (socketId) {
            io.to(socketId).emit('receiveMessage', savedMessage);
          }
        });

      } catch (err) {
        console.error('❌ Ошибка при отправке сообщения:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('Пользователь отключен:', socket.id);
      for (const [userId, socketId] of users.entries()) {
        if (socketId === socket.id) {
          users.delete(userId);
          break;
        }
      }
    });
  });
};
