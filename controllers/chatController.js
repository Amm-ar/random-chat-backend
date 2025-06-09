// /controllers/chatController.js

const { updateStats } = require('./adminController');

let activeUsers = {};
let waitingUsers = []; // [{id, language, tag}]
let partners = {};

// Track last activity timestamps
const lastActivity = {}; // { socketId: timestamp }

// Function to update user's last activity time
function updateActivity(socketId) {
  lastActivity[socketId] = Date.now();
}


module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    activeUsers[socket.id] = true;
    updateStats.incrementUser();

    function cleanup(socketId) {
      waitingUsers = waitingUsers.filter(id => id !== socketId);
      const partnerId = partners[socketId];
      if (partnerId) {
        delete partners[partnerId];
      }
      delete partners[socketId];
    }

    socket.on('find_partner', ({ language, tag }) => {
      cleanup(socket.id);

      // Search matching partner
      const index = waitingUsers.findIndex(user =>
        (user.language === language || language === "any" || user.language === "any") &&
        (user.tag === tag || user.tag === "general" || tag === "general")
      );

      if (index !== -1) {
        const partner = waitingUsers.splice(index, 1)[0];
        partners[socket.id] = partner.id;
        partners[partner.id] = socket.id;
        io.to(socket.id).emit('partner_found');
        io.to(partner.id).emit('partner_found');
      } else {
        waitingUsers.push({ id: socket.id, language, tag });
      }
    });


    // When sending or receiving messages
    socket.on('send_message', (data) => {
      const partnerId = partners[socket.id];
      if (partnerId) {
        io.to(partnerId).emit('receive_message', {
          from: socket.id,
          message: data.message
        });
        updateActivity(socket.id);
        updateActivity(partnerId);
      }
    });

    socket.on('disconnect_from_partner', () => {
      const partnerId = partners[socket.id];
      if (partnerId) {
        io.to(partnerId).emit('partner_left');
        cleanup(partnerId);
      }
      cleanup(socket.id);
    });

    socket.on('typing', () => {
      updateActivity(socket.id);
      const partnerId = partners[socket.id];
      if (partnerId) {
        io.to(partnerId).emit('partner_typing');
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      updateStats.decrementUser();
      const partnerId = partners[socket.id];
      if (partnerId) {
        io.to(partnerId).emit('partner_left');
        cleanup(partnerId);
      }
      cleanup(socket.id);
      delete activeUsers[socket.id];
    });

    // Inactivity Check (every 120 sec)
    setInterval(() => {
      const now = Date.now();
      for (let socketId in activeUsers) {
        if (lastActivity[socketId] && now - lastActivity[socketId] > 60000) { // 1 minute timeout
          const partnerId = partners[socketId];
          if (partnerId) {
            io.to(socketId).emit('partner_left');
            io.to(partnerId).emit('partner_left');
            cleanup(socketId);
            cleanup(partnerId);
          } else {
            cleanup(socketId);
          }
        }
      }
    }, 120000); // Check every 120 sec
  });

};

module.exports.activeUsers = activeUsers;
