// server.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const path = require('path');

const chatController = require('./controllers/chatController');
const adminController = require('./controllers/adminController');
const { verifyAdmin } = require('./middlewares/authMiddleware');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.post('/admin/login', adminController.login);
app.get('/admin/stats', verifyAdmin, adminController.getStats);

// Frontend pages
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin-dashboard', verifyAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// WebSocket
chatController(io);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
