import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import validator from 'validator'
import { SendVerificationCode } from '../middleware/Email.js';
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET; 

// Signup Route
router.post('/signup', async (req, res) => {
    const { email, username, password } = req.body;
  try {
    
    if(!email || !username || !password){
      return res.status(400).json({message: 'username, Email and password are required'})
    }
    if(!validator.isEmail(email)){
      return res.status(400).json({message: 'Invalid email format'})
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000);
    const user = new User({
      email,
      username,
      password: hashedPassword,
      verificationCode,
      isVerified:false,
      verificationCodeExpires
    })
    await user.save();
    SendVerificationCode(user.email, verificationCode)

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/delete', async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ message: 'Username , Email and password are required' });
  }
  try {
    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({message: 'Invalid password' });
    }
    await User.deleteOne({email})
    res.status(200).json({ message: 'User and associated chats deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    if(!username || !password){
      return res.status(400).json({message: 'username and password are required'})
    }
   
    const user = await User.findOne({ username });

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    if(!user.isVerified){
      return res.status(400).json({message: 'Please verify your email before logging in. Check your email for verification'})
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// verify
router.post('/verify', async (req, res) => {
  try {
    const { code } = req.body;
    console.log('Verification attempt with code:', code);
    if (!code) {
      return res.status(400).json({ 
        message: "Verification code is required" 
      });
    }
    const user = await User.findOne({
      verificationCode: code,
    });
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) {
      return res.status(400).json({  
        message: "Invalid or expired verification code" 
      });
    }
     if(new Date() > user.verificationCodeExpires){
      return res.status(400).json({
        message: "Verification code has expired. please request a new one"
      })
    }
    await User.findOneAndUpdate(
      { _id: user._id },
      { 
        $set: { isVerified: true },
        $unset: { verificationCode: 1,
          verificationCodeExpires:1
        }
      }
    );
    console.log('User verified successfully:', user.email);
    res.status(200).json({ 
      message: "Email verified successfully! You can now log in." 
    }); 
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({  
      message: "Internal server error" 
    });
  }
})

//Resend otp route
router.post('/resend-otp',async(req,res) => {
  try{
    const{email} = req.body;
    if(!email){
       return res.status(400).json({ message: 'Email is required' });
    }
    if(!validator.isEmail(email)){
      return res.status(400).json({
        message: "Invalid email format"
      })
    }
    const user = await User.findOne({email})
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000); 
    await User.findOneAndUpdate(
      { email },
      { 
        verificationCode,
        verificationCodeExpires
      }
    );

    SendVerificationCode(email, verificationCode);

    res.status(200).json({ message: 'New verification code sent successfully' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
  
})


export default router;
