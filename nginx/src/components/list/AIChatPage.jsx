import { useState, useEffect } from 'react';
import ChatInput from './ChatInput';
import Header from './Header';
import './chat.css';
import { API_URL } from '../../constants';

const AIChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/auth-check`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserId(data.user.id);
        }
      })
      .catch(error => console.error('Ошибка авторизации:', error));
  }, []);

  const handleSendMessage = async (message) => {
    if (!message.trim() || !userId) return;

    const userMessage = {
      id: `local-${Date.now()}`,
      text: message,
      sender_id: userId,
      sender_name: 'You',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch(`${API_URL}/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      const aiMessage = {
        id: `ai-${Date.now()}`,
        text: data.reply || "🤖 Что-то пошло не так...",
        sender_id: 'ai',
        sender_name: 'AI',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Ошибка при запросе к AI:', err);
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
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.sender_id === userId ? "chat-me" : "chat-other"}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default AIChatPage;
