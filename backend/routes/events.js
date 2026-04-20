const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const User = require('../models/User');
const Event = require('../models/Event');

router.get('/recommended', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const interests = user.interests || [];

    const events = await Event.find({
      tags: { $in: interests }
    }).sort({ date: 1 });

    res.json(events);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;