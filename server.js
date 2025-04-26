// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { setupChatHandlers } = require('./controllers/chatController');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Setup socket handlers
io.on('connection', (socket) => {
    setupChatHandlers(socket, io);
});

// Basic route (optional now)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
