const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const dotenv = require('dotenv');
dotenv.config();
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    console.log(req.user);
    console.log(roles.includes(req.user.role));
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role)) { 
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};

module.exports = { authenticate, authorize };