import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import ChatInput from './ChatInput.jsx';
import Header from './Header.jsx';
import './chat.css';

const Chat = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', { withCredentials: true });

    fetch('http://localhost:3000/auth-check', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserId(data.user.id);
          newSocket.emit('authenticate', data.user.id);
        }
      })
      .catch(error => console.error('Ошибка авторизации:', error));

    newSocket.on('receiveMessage', (msg) => {
      console.log("Получено сообщение:", msg);
      console.log("chatId из URL:", chatId);
      console.log("chat_id из сообщения:", msg.chat_id);
    
      if (msg.chat_id === chatId) {
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages, msg];
          console.log("Обновленные сообщения:", updatedMessages);
          return updatedMessages;
        });
      }
    });

    fetch(`http://localhost:3000/messages/${chatId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setMessages(data);
      })
      .catch(error => console.error('Ошибка при загрузке сообщений:', error));

    setSocket(newSocket);

    return () => {
      newSocket.off('receiveMessage');
      newSocket.disconnect();
    };
  }, [chatId]);

  const handleSendMessage = (message) => {
    if (message.trim()) {
      if (!userId || !chatId) {
        console.error('Ошибка: ID пользователя или chatId не найден');
        return;
      }
      console.log('Отправка сообщения:', { chatId, senderId: userId, text: message });

      const receiverId = userId === 5 ? 3 : 5;

      socket.emit('sendMessage', { senderId: userId, chatId, text: message });

      const newMessage = {
        id: Date.now(),
        text: message,
        sender_id: userId,
        receiver_id: receiverId,
        chat_id: chatId,
        sender_name: 'You',
        timestamp: new Date().toISOString(),
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
    }
  };

  useEffect(() => {
    const chatContainer = document.getElementById("chatContainer");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className='chat-container'>
      <Header />
      <div id="chatContainer" className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender_id === userId ? "chat-me" : "chat-other"}`}>
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
