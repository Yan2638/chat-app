const { Client } = require('../db');

const getUsers = async (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Пользователь не авторизован' });

  try {
    const userResult = await Client.query('SELECT id FROM "users" WHERE auth_token = $1', [token]);
    if (userResult.rows.length === 0) return res.status(401).json({ message: 'Неверный токен' });

    const result = await Client.query('SELECT id, "Name", "Email" FROM "users"');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ message: 'Ошибка при получении пользователей' });
  }
};

module.exports = { getUsers };
