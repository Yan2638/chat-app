import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import ChatInput from './ChatInput.jsx';
import Header from './Header.jsx';
import './chat.css';

const socket = io('http://localhost:3000', { withCredentials: true });

const Chat = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    fetch('http://localhost:3000/auth-check', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserId(data.user.id);
          socket.emit('authenticate', data.user.id);
        }
      })
      .catch(error => console.error('Ошибка авторизации:', error));

    if (chatId) {
      fetch(`http://localhost:3000/messages/${chatId}`, {
        method: "GET",
        credentials: "include",
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch(error => console.error("Ошибка загрузки сообщений:", error));
    }

    socket.on('receiveMessage', (msg) => {
      console.log("Получено сообщение:", msg);
      if (msg.chat_id === chatId) {
        setMessages(prevMessages => {
          return [...prevMessages, msg];
        });
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [chatId]);

  const sendMessage = async (chatId, senderId, text) => {
    try {
      const response = await fetch('http://localhost:3000/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : "", 
        },
        credentials: 'include',
        body: JSON.stringify({
          text: text,
          chatId: chatId,
          senderId: senderId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Сообщение отправлено:', data);
        socket.emit('sendMessage', data);
      } else {
        console.error('Ошибка при отправке сообщения:', data.message);
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса:', error);
    }
  };

  const handleSendMessage = (message) => {
    if (message.trim()) {
      if (!userId || !chatId) {
        console.error('Ошибка: ID пользователя или chatId не найден');
        return;
      }
      sendMessage(chatId, userId, message); 
    }
  };

  useEffect(() => {
    console.log('chatId из URL:', chatId);
  }, [chatId]);

  return (
    <div className='chat-container'>
      <Header />
      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className={`chat-message ${parseInt(msg.sender_id) === parseInt(userId) ? "chat-me" : "chat-other"}`}>
              {msg.text}
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
