// utils/aiUtils.js

function buildPrompt(history, newMessage) {
  const formatted = history
    .map(msg => `${msg.sender === 'user' ? 'Пользователь' : 'Ассистент'}: ${msg.text}`)
    .join('\n');

  return `
Ты — дружелюбный ассистент. Отвечай ясно и по делу.
${formatted}
Пользователь: ${newMessage}
Ассистент:
  `;
}

module.exports = { buildPrompt };
