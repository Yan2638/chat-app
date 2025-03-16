import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import ChatInput from './ChatInput.jsx';
import Header from './Header.jsx';
import './chat.css';
import { API_URL } from '../../constants';

const Chat = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);

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

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      if (String(msg.chat_id) === String(chatId)) {
        setMessages(prevMessages => {
          const messagesSet = new Set(prevMessages.map(m => m.id));
          if (messagesSet.has(msg.id)) {
            return prevMessages;
          }
          return [...prevMessages, msg];
        });
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [socket, chatId]);

  useEffect(() => {
    fetch(`${API_URL}/messages/${chatId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(error => console.error('Ошибка при загрузке сообщений:', error));
  }, [chatId]);

  const handleSendMessage = (message) => {
    if (!message.trim() || !userId || !chatId || !socket) {
      console.error('Ошибка: ID пользователя, chatId или сокет не найден');
      return;
    }

    console.log('Отправка сообщения:', { chatId, senderId: userId, text: message });

    const receiverId = userId === 5 ? 3 : 5;
    const newMessage = {
      id: Date.now(),
      text: message,
      sender_id: userId,
      receiver_id: receiverId,
      chat_id: chatId,
      sender_name: 'You',
      timestamp: new Date().toISOString(),
    };

    setMessages(prevMessages => {
      const messagesSet = new Set(prevMessages.map(m => m.id));
      if (messagesSet.has(newMessage.id)) {
        return prevMessages;
      }
      return [...prevMessages, newMessage];
    });

    socket.emit('sendMessage', { senderId: userId, chatId, text: message });
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
