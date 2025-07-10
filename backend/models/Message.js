import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  // isRead: {
  //   type: Boolean,
  //   default: false
  // }
}, { 
  timestamps: true // This creates createdAt and updatedAt automatically
});

const Message = mongoose.model('Message', messageSchema);
export default Message;