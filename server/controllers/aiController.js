// controllers/aiController.js
const fetch = require('node-fetch');
const axios = require('axios');
const { buildPrompt } = require('../utils/aiUtils');

exports.generateAIResponse = async (req, res) => {
  const { history, newMessage } = req.body;

  if (!newMessage) {
    return res.status(400).json({ error: 'Сообщение отсутствует' });
  }

  try {
    const prompt = buildPrompt(history || [], newMessage);

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma:2b',
        prompt,
        stream: false,
      }),
    });

    const data = await response.json();

    res.status(200).json({ reply: data.response });
  } catch (err) {
    console.error('Ошибка общения с AI:', err);
    res.status(500).json({ error: 'Ошибка генерации ответа AI' });
  }
};
