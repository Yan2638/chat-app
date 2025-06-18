const http = require('http');
const app = require('./app');
const initSocket = require('./sockets/chatSocket');

const server = http.createServer(app);
initSocket(server); // WebSocket вынесем в отдельный модуль

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});

const authController = require('./controllers/authController');

app.post('/register', authController.register);
app.post('/login', authController.login);
app.post('/logout', authController.logout);
app.get('/auth-check', authController.authCheck);
