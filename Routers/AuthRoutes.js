const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const UserDAO = require('../DAO/UserDAO');

router.post('/register', async (req, res) => {
  const { email, password, fn, sn } = req.body;
  try {
    const user = await UserDAO.createUser(email, password, fn, sn);
    res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await UserDAO.findByEmail(email);
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = user;
    res.status(200).json({ message: 'Logged in', user });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: 'Logged out' });
});

router.get('/me', (req, res) => {
  if (req.session.user) {
    res.status(200).json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

module.exports = router;