// /controllers/chatController.js
const { updateStats } = require('./adminController');

let activeUsers = {}; // All connected users
let waitingUsers = []; // Users waiting to be matched
let partners = {}; // Map of socket.id -> partner.id

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    activeUsers[socket.id] = true;
    updateStats.incrementUser();

    // Handle finding a partner
    socket.on('find_partner', () => {
      console.log(`User ${socket.id} is looking for a partner.`);

      // Check if someone is already waiting
      if (waitingUsers.length > 0) {
        const partnerSocketId = waitingUsers.shift(); // get first waiting
        partners[socket.id] = partnerSocketId;
        partners[partnerSocketId] = socket.id;

        // Notify both users they are connected
        io.to(socket.id).emit('partner_found');
        io.to(partnerSocketId).emit('partner_found');
      } else {
        // No one waiting, add to waiting list
        waitingUsers.push(socket.id);
      }
    });

    // Handle sending messages
    socket.on('send_message', (data) => {
      console.log(`Message from ${socket.id}: ${data.message}`);
      updateStats.incrementMessage();

      const partnerId = partners[socket.id];
      if (partnerId) {
        io.to(partnerId).emit('receive_message', {
          from: socket.id,
          message: data.message
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      delete activeUsers[socket.id];

      // Remove from waiting list if waiting
      waitingUsers = waitingUsers.filter(id => id !== socket.id);

      // Notify partner if connected
      const partnerId = partners[socket.id];
      if (partnerId) {
        io.to(partnerId).emit('partner_left');
        delete partners[partnerId];
        delete partners[socket.id];
      }
    });
  });
};

module.exports.activeUsers = activeUsers;
