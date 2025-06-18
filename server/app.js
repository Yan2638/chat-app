const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const aiRoutes = require('./routes/aiRoutes');
const cryptoRoutes = require('./routes/cryptoRoutes');



app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Подключение маршрутов
app.use(require('./routes/authRoutes'));
app.use(require('./routes/userRoutes'));
app.use(require('./routes/chatRoutes'));
app.use('/api/ai', aiRoutes);
app.use('/api', cryptoRoutes);



module.exports = app;
