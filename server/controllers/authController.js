const crypto = require('crypto');
const client = require('../db');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Все поля обязательны!" });
  }

  try {
    const result = await client.query(
      `INSERT INTO "users" ("Name", "Email", "Password") VALUES ($1, $2, $3) RETURNING *`,
      [username, email, password]
    );

    const user = result.rows[0];
    const token = crypto.randomBytes(64).toString('hex');

    await client.query(
      'UPDATE "users" SET auth_token = $1 WHERE id = $2',
      [token, user.id]
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000,
    });

    res.status(201).json({ message: "Регистрация успешна!", user });
  } catch (err) {
    console.error("Ошибка при регистрации:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Все поля обязательны!" });
  }

  try {
    const result = await client.query(
      'SELECT "id", "Name", "Email", "Password" FROM "users" WHERE "Email" = $1',
      [email]
    );

    if (result.rows.length === 0 || result.rows[0].Password !== password) {
      return res.status(401).json({ error: "Неверный email или пароль!" });
    }

    const user = result.rows[0];
    const token = crypto.randomBytes(64).toString('hex');

    await client.query(
      'UPDATE "users" SET auth_token = $1 WHERE id = $2',
      [token, user.id]
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Авторизация успешна!", user });
  } catch (err) {
    console.error("Ошибка при логине:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

exports.logout = async (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(400).json({ error: 'Токен не найден' });
  }

  try {
    await client.query('UPDATE "users" SET auth_token = NULL WHERE auth_token = $1', [token]);
    res.clearCookie('auth_token');
    res.json({ message: 'Выход выполнен успешно' });
  } catch (err) {
    console.error("Ошибка при выходе:", err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.authCheck = async (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: "Пользователь не авторизован" });
  }

  try {
    const result = await client.query(
      `SELECT id, "Name", "Email" FROM "users" WHERE "auth_token" = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Не найден пользователь с таким токеном" });
    }

    const user = result.rows[0];
    res.status(200).json({ user });
  } catch (error) {
    console.error('Ошибка при проверке авторизации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
