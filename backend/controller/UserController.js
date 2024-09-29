const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    await user.save();
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, { httpOnly: true, secure: true });
      res.json({ token , user , message: "User registered successfully"});
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {id: user.id, username: user.username, email: user.email, role: user.role };

    jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' }, (err, token) => { 
      if (err) {
        console.error('Error signing token:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      };
      res.cookie('token', token, cookieOptions);
      res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role }, message: 'Logged in successfully' });
    });
    
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server error');
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
    register,
    login,
    logout
};