const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }

    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      return res.status(403).json({ message: `Your account is ${user.status.toLowerCase()}.` });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error authorizing owner access.' });
  }
};

module.exports = adminMiddleware;
