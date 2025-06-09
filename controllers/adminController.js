// /controllers/adminController.js
const os = require('os');

// In-memory stats for now (you can connect it to SQLite later)
let totalUsers = 0;
let totalMessages = 0;

const sessions = {}; // Temporary session store

// Function to handle admin login
exports.login = (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    // Set secure cookie valid for 10 min
    res.cookie('adminAuth', 'true', {
      maxAge: 10 * 60 * 1000, // 10 minutes
      httpOnly: true,
      secure: false // Set to true if using HTTPS
    });
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
};

// Function to send back stats to dashboard
exports.getStats = (req, res) => {
  res.json({
    activeUsers: Object.keys(require('../controllers/chatController').activeUsers || {}).length,
    totalUsers,
    totalMessages,
    serverUptime: os.uptime()
  });
};

// Export update functions
exports.updateStats = {
  incrementUser: () => { totalUsers++; },
  incrementMessage: () => { totalMessages++; },
  decrementUser: () => { totalUsers--; },
};
