const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); 
const auth = require('../middleware/auth');
const User = require('../models/User.js');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false 
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    user = new User({ name, email, password, role });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, msg: "User registered successfully" });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User doesn't exist" });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; 
    await user.save();

    const resetUrl = `https://swipers-wo1u.onrender.com/api/auth/resetpassword/${resetToken}`;

    const mailOptions = {
      from: `"Swipers Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h3>You requested a password reset</h3>
        <p>Please click the link below to choose a new password. This link is valid for 1 hour.</p>
        <a href="${resetUrl}" style="background-color: #4A90E2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset My Password</a>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: "Reset link sent to your email!" });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/resetpassword/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) return res.status(400).send("<h1>Link Expired</h1>");
    res.send(`
      <form action="/api/auth/resetpassword/${req.params.token}" method="POST">
        <input type="password" name="password" placeholder="New Password" required />
        <button type="submit">Reset Password</button>
      </form>
    `);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.post('/resetpassword/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).send("Password required");

    const user = await User.findOne({ 
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ msg: "Invalid or expired reset link" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.send("<h1>Success!</h1><p>Password updated. You can now log in via the app.</p>");
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.put('/update-profile', auth, async (req, res) => {
  try {
    const { name, year, major, bio, avatar, interests } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (name) user.name = name;
    if (year) user.year = year;
    if (major) user.major = major;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.profilePicture = avatar; 
    if (interests) user.interests = interests;

    await user.save();
    res.json({ msg: "Profile updated!", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
