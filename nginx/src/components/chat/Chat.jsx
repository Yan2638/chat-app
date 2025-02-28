import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ChatInput from './ChatInput.jsx';
import Header from './Header.jsx';
import './chat.css';

const socket = io('http://localhost:3000', { withCredentials: true });

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/auth-check', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserId(data.user.id);
          console.log('User ID:', data.user.id);
          socket.emit('authenticate', data.user.id);
        }
      })
      .catch(error => console.error('Ошибка при проверке авторизации:', error));

    fetch('http://localhost:3000/messages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          console.error('Ошибка: ожидаемый массив, получен:', data);
          setMessages([]);
        }
      })
      .catch(error => {
        console.error('Ошибка при получении сообщений:', error);
        setMessages([]);
      });

    socket.on('receiveMessage', (msg) => {
      console.log("Получено сообщение от сервера:", msg);
      if (msg.text && !messages.some(message => message.id === msg.id)) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [userId]);

  const handleSendMessage = (message) => {
    if (message.trim()) {
      socket.emit('sendMessage', { senderId: userId, text: message });
      ([
        
      ]);
    }
  };

  return (
    <div className='chat-container'>
      <Header />
      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender_id === userId ? "chat-me" : "chat-other"}`}>
              {msg.text ? msg.text : "Сообщение без текста"}
            </div>
          ))
        ) : (
          <div>Нет сообщений</div>
        )}
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default Chat;
