// /middlewares/authMiddleware.js

// Middleware to verify admin authentication
exports.verifyAdmin = (req, res, next) => {
    if (req.cookies.adminAuth === 'true') {
      next();
    } else {
      return res.redirect('/admin');
    }
  };
  