import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Button, Typography, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { API_URL } from '../../constants'; // путь к твоему API_URL


const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const newSocket = io(API_URL, { withCredentials: true });
    setSocket(newSocket);

    fetch(`${API_URL}/auth-check`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserId(data.user.id);
          newSocket.emit('authenticate', data.user.id);
        }
      })
      .catch(error => console.error('Ошибка авторизации:', error));

    newSocket.on('receiveMessage', (msg) => {
      if (msg.sender_id !== userId) {
        setMessages((prevMessages) => [...prevMessages, msg]);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessageToBot = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    if (socket) {
      // Отправляем сообщение через сокет
      socket.emit('sendMessage', {
        senderId: userId,
        text: input,
        chatId: 'ai-chat', // это можно изменить в зависимости от того, как устроены чаты
      });
    }

    try {
      const response = await fetch(`${API_URL}/api/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newMessage: input }),
      });
      const data = await response.json();
      const botMessage = { sender: 'bot', text: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Ошибка при общении с AI:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className='chat-container'>
      <div id="chatContainer" className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.sender === 'user' ? 'chat-me' : 'chat-other'}`}
            >
              <Typography>
                <b>{msg.sender === 'user' ? 'Вы' : 'Бот'}:</b> {msg.text}
              </Typography>
            </div>
          ))
        ) : (
          <div>Чат пуст</div>
        )}
        {loading && <Typography align="center">Бот печатает...</Typography>}
      </div>

      <div className="chat-input">
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          label="Ваш вопрос"
          variant="outlined"
          size="small"
          disabled={loading}
        />
        <Button onClick={sendMessageToBot} disabled={loading} variant="contained" size="large">
          <SendIcon />
        </Button>
      </div>
    </div>
  );
};

export default AIChat;
