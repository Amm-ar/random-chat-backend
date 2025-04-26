// controllers/chatController.js

const { generateRandomUsername, detectPersonalInfo, getLocationFromIp } = require('../utils/helpers');
const { logConnection } = require('../db/database');

let waitingQueue = []; // Store waiting users

function setupChatHandlers(socket, io) {
    console.log('New user connected:', socket.id);

    // Assign username
    const username = generateRandomUsername();
    socket.data.username = username;

    // Fetch IP and location
    const ip = socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress;
    socket.data.ip = ip;

    getLocationFromIp(ip).then(location => {
        socket.data.location = location;
        console.log(`User ${username} from ${location}`);

        // Log to database
        logConnection(username, ip, location);
    }).catch(err => {
        console.log('Location fetch error:', err.message);
    });

    // Handle 'ready' event to join queue
    socket.on('ready', () => {
        if (!waitingQueue.includes(socket)) {
            waitingQueue.push(socket);
            matchUsers(io);
        }
    });

    // Handle sending message
    socket.on('send_message', (message) => {
        if (!socket.data.room) {
            socket.emit('error_message', 'You are not connected yet.');
            return;
        }

        const detected = detectPersonalInfo(message);

        if (detected) {
            socket.emit('personal_info_warning', {
                originalMessage: message,
                warning: 'Your message may contain personal info. Confirm to send.'
            });
        } else {
            io.to(socket.data.room).emit('receive_message', {
                sender: socket.data.username,
                message: message
            });
        }
    });

    // Confirm sending after warning
    socket.on('confirm_send', (message) => {
        if (socket.data.room) {
            io.to(socket.data.room).emit('receive_message', {
                sender: socket.data.username,
                message: message
            });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`User ${socket.data.username} disconnected.`);

        // Remove from queue if still waiting
        waitingQueue = waitingQueue.filter(user => user.id !== socket.id);

        if (socket.data.room) {
            socket.to(socket.data.room).emit('user_left', {
                message: `${socket.data.username} has left the chat.`
            });
        }
    });
}

/**
 * Try to match two users from queue
 */
function matchUsers(io) {
    while (waitingQueue.length >= 2) {
        const user1 = waitingQueue.shift();
        const user2 = waitingQueue.shift();

        const room = `room-${user1.id}-${user2.id}`;
        user1.join(room);
        user2.join(room);

        user1.data.room = room;
        user2.data.room = room;

        io.to(room).emit('start_chat', {
            users: [user1.data.username, user2.data.username]
        });
    }
}

module.exports = {
    setupChatHandlers
};

// /controllers/chatController.js
const { updateStats } = require('./adminController');

let activeUsers = {}; // Store socket ids

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    activeUsers[socket.id] = true;
    updateStats.incrementUser();

    socket.on('send_message', (data) => {
      console.log(`Message from ${socket.id}:`, data.message);
      updateStats.incrementMessage();

      socket.broadcast.emit('receive_message', {
        from: socket.id,
        message: data.message
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      delete activeUsers[socket.id];
    });
  });
};

module.exports.activeUsers = activeUsers;
