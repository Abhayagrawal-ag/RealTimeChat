


import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ message: 'Invalid token' });
    }

    // Fix: Ensure consistent user ID structure
    req.user = { 
      id: decoded._id || decoded.id || decoded.userId,
      _id: decoded._id || decoded.id || decoded.userId,
      username: decoded.username,
      email: decoded.email
    };
    
    console.log('Authenticated user:', req.user);
    next();
  });
};

// Get all users except current user
router.get('/users', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching users for user ID:', req.user.id);
    
    const users = await User.find({ 
      _id: { $ne: req.user.id },
      isVerified: true // Only get verified users
    }).select('-password -verificationCode');
    
    console.log('Found users:', users.length);
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching current user with ID:', req.user.id);
    
    const user = await User.findById(req.user.id).select('-password -verificationCode');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Current user found:', user.username);
    res.json({ user });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send a message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { receiver, content } = req.body;
    
    console.log('Sending message from:', req.user.id, 'to:', receiver);
    
    if (!receiver || !content) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }
    
    const message = new Message({
      sender: req.user.id,
      receiver,
      content: content.trim(),
      timestamp: new Date(),
      createdAt: new Date() // Add this for consistency
    });

    await message.save();
    
    // Populate sender and receiver info
    await message.populate('sender', 'username email');
    await message.populate('receiver', 'username email');
    
    console.log('Message saved:', message._id);
    res.status(201).json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get messages between two users
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Fetching messages between:', req.user.id, 'and:', userId);
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ]
    })
    .populate('sender', 'username email')
    .populate('receiver', 'username email')
    .sort({ timestamp: 1, createdAt: 1 }); // Sort by both fields

    console.log('Found messages:', messages.length);
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
