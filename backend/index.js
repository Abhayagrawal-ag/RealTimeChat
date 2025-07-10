// // import express from 'express'
// // import http from 'http'
// // import {Server} from 'socket.io';
// // import path from 'path'
// // import {fileURLToPath} from 'url';
// // import cors from 'cors';
// // import dotenv from 'dotenv'
// // import connectDB from './config/db.js'
// // import authRoutes from './routes/authRoutes.js'
// // import messageRoutes from './routes/messageRoutes.js'

// // dotenv.config();
// // const PORT = process.env.PORT|| 3000;

// // // required to use __dirname with ES Modules
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // connectDB(); // mongoDB connection

// // // Initialize app and server
// // const app = express();
// // const server = http.createServer(app)
// // const io = new Server(server, {
// //   cors: {
// //     origin: "http://localhost:5173",
// //     methods: ["GET", "POST"],
// //     credentials:true
// //   }
// // });

// // // CORS allow frontend origin
// // app.use(cors({
// //   origin: 'http://localhost:5173',
// //   methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
// //   credentials:true
// // }));

// // app.use(express.json()); // to parse JSON from frontend
// // app.use('/api/auth', authRoutes) // login/signup
// // app.use('/api/messages', messageRoutes) // message routes

// // //server static files from frontend folder
// // app.use(express.static(path.join(__dirname, '../frontend/chat_application')))

// // // Store active users
// // const activeUsers = new Map();

// // // Handle socket connection
// // io.on('connection', (socket) => {
// //   console.log('User connected:', socket.id);

// //   // User joins
// //   socket.on('user_connected', (userId) => {
// //     activeUsers.set(userId, socket.id);
// //     console.log(`User ${userId} connected with socket ${socket.id}`);
// //   });

// //   // Handle sending messages
// //   socket.on('send_message', (messageData) => {
// //     console.log('Message received:', messageData);
    
// //     // Send to specific user if they're online
// //     const receiverSocketId = activeUsers.get(messageData.receiver._id || messageData.receiver);
// //     if (receiverSocketId) {
// //       io.to(receiverSocketId).emit('receive_message', messageData);
// //     }
    
// //     // Also send back to sender for confirmation
// //     socket.emit('message_sent', messageData);
// //   });

// //   // Handle typing indicator
// //   socket.on('typing', (data) => {
// //     const receiverSocketId = activeUsers.get(data.receiverId);
// //     if (receiverSocketId) {
// //       io.to(receiverSocketId).emit('user_typing', {
// //         userId: data.userId
// //       });
// //     }
// //   });

// //   // Handle old chat message event (for backward compatibility)
// //   socket.on('chat message', (msg) => {
// //     console.log('message:', msg);
// //     io.emit('chat message', msg) // broadcast to everyone
// //   })

// //   // Handle disconnect
// //   socket.on('disconnect', () => {
// //     console.log('User disconnected:', socket.id);
// //     // Remove user from active users
// //     for (let [userId, socketId] of activeUsers.entries()) {
// //       if (socketId === socket.id) {
// //         activeUsers.delete(userId);
// //         break;
// //       }
// //     }
// //   });
// // });

// // // start the server
// // server.listen(PORT, () => {
// //   console.log(`Server running at http://localhost:${PORT}`)
// // })

// import express from 'express'
// import http from 'http'
// import {Server} from 'socket.io';
// import path from 'path'
// import {fileURLToPath} from 'url';
// import cors from 'cors';
// import dotenv from 'dotenv'
// import connectDB from './config/db.js'
// import authRoutes from './routes/authRoutes.js'
// import messageRoutes from './routes/messageRoutes.js'

// dotenv.config();
// const PORT = process.env.PORT|| 3000;

// // required to use __dirname with ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// connectDB(); // mongoDB connection

// // Initialize app and server
// const app = express();
// const server = http.createServer(app)
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//     credentials:true
//   }
// });

// // CORS allow frontend origin
// app.use(cors({
//   origin: 'http://localhost:5173',
//   methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
//   credentials:true
// }));

// app.use(express.json()); // to parse JSON from frontend
// app.use('/api/auth', authRoutes) // login/signup
// app.use('/api/messages', messageRoutes) // message routes

// //server static files from frontend folder
// app.use(express.static(path.join(__dirname, '../frontend/chat_application')))

// // Store active users and their socket connections
// const activeUsers = new Map(); // userId -> socketId
// const onlineUsers = new Set(); // Track online user IDs

// // Handle socket connection
// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   // User comes online
//   socket.on('user_online', (userId) => {
//     console.log(`User ${userId} came online with socket ${socket.id}`);
    
//     // Store user connection
//     activeUsers.set(userId, socket.id);
//     onlineUsers.add(userId);
    
//     // Join user to their own room for easier message delivery
//     socket.join(userId);
    
//     // Notify all OTHER clients about user coming online (not the user themselves)
//     socket.broadcast.emit('user_online', userId);
    
//     // Send current online users list to the newly connected user
//     socket.emit('online_users', Array.from(onlineUsers));
    
//     console.log('Current online users:', Array.from(onlineUsers));
//   });

//   // User goes offline
//   socket.on('user_offline', (userId) => {
//     console.log(`User ${userId} went offline`);
    
//     // Remove user from online status
//     activeUsers.delete(userId);
//     onlineUsers.delete(userId);
    
//     // Leave user room
//     socket.leave(userId);
    
//     // Notify all clients about user going offline
//     socket.broadcast.emit('user_offline', userId);
    
//     console.log('Current online users after offline:', Array.from(onlineUsers));
//   });

//   // Handle sending messages
//   socket.on('send_message', (messageData) => {
//     console.log('Message received:', messageData);
    
//     // Get receiver ID (handle both object and string formats)
//     const receiverId = messageData.receiver._id || messageData.receiver;
//     const senderId = messageData.sender._id || messageData.sender;
    
//     console.log(`Sending message from ${senderId} to ${receiverId}`);
    
//     // Send to specific user if they're online using room
//     if (onlineUsers.has(receiverId)) {
//       io.to(receiverId).emit('receive_message', messageData);
//       console.log(`Message delivered to user ${receiverId}`);
//     } else {
//       console.log(`User ${receiverId} is offline, message not delivered in real-time`);
//     }
    
//     // Send confirmation back to sender
//     socket.emit('message_sent', {
//       ...messageData,
//       delivered: onlineUsers.has(receiverId)
//     });
//   });

//   // Handle typing indicator
//   socket.on('typing', (data) => {
//     console.log('Typing event:', data);
//     const { receiverId, userId } = data;
    
//     if (onlineUsers.has(receiverId)) {
//       io.to(receiverId).emit('user_typing', {
//         userId: userId
//       });
//       console.log(`Typing indicator sent from ${userId} to ${receiverId}`);
//     }
//   });

//   // Handle stop typing
//   socket.on('stop_typing', (data) => {
//     const { receiverId, userId } = data;
    
//     if (onlineUsers.has(receiverId)) {
//       io.to(receiverId).emit('user_stop_typing', {
//         userId: userId
//       });
//     }
//   });

//   // Legacy event for backward compatibility
//   socket.on('user_connected', (userId) => {
//     // Redirect to the new user_online event
//     socket.emit('user_online', userId);
//   });

//   // Handle old chat message event (for backward compatibility)
//   socket.on('chat message', (msg) => {
//     console.log('message:', msg);
//     io.emit('chat message', msg) // broadcast to everyone
//   })

//   // Handle disconnect
//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
    
//     // Find and remove user from active users and online status
//     let disconnectedUserId = null;
//     for (let [userId, socketId] of activeUsers.entries()) {
//       if (socketId === socket.id) {
//         disconnectedUserId = userId;
//         activeUsers.delete(userId);
//         onlineUsers.delete(userId);
//         break;
//       }
//     }
    
//     // Notify all clients about user going offline
//     if (disconnectedUserId) {
//       socket.broadcast.emit('user_offline', disconnectedUserId);
//       console.log(`User ${disconnectedUserId} disconnected and went offline`);
//       console.log('Remaining online users:', Array.from(onlineUsers));
//     }
//   });
// });

// // start the server
// server.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`)
// })


import express from 'express'
import http from 'http'
import {Server} from 'socket.io';
import path from 'path'
import {fileURLToPath} from 'url';
import cors from 'cors';
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import messageRoutes from './routes/messageRoutes.js'

dotenv.config();
const PORT = process.env.PORT|| 3000;

// required to use __dirname with ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB(); // mongoDB connection

// Initialize app and server
const app = express();
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials:true
  }
});

// CORS allow frontend origin
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials:true
}));

app.use(express.json()); // to parse JSON from frontend
app.use('/api/auth', authRoutes) // login/signup
app.use('/api/messages', messageRoutes) // message routes

//server static files from frontend folder
app.use(express.static(path.join(__dirname, '../frontend/chat_application')))

// Store active users and their socket connections
const activeUsers = new Map(); // userId -> socketId
const onlineUsers = new Set(); // Track online user IDs
const userSockets = new Map(); // socketId -> userId (reverse mapping)

// Helper function to broadcast online users list to all clients
const broadcastOnlineUsers = () => {
  const onlineUsersList = Array.from(onlineUsers);
  io.emit('online_users', onlineUsersList);
  console.log('Broadcasting online users:', onlineUsersList);
};

// Handle socket connection
io.on('connection', (socket) => {
  console.log('New socket connection:', socket.id);

  // User comes online
  socket.on('user_online', (userId) => {
    console.log(`User ${userId} requesting to come online with socket ${socket.id}`);
    
    if (!userId) {
      console.log('Invalid userId provided');
      return;
    }

    // Handle reconnection - remove old socket if exists
    if (activeUsers.has(userId)) {
      const oldSocketId = activeUsers.get(userId);
      console.log(`User ${userId} reconnecting. Old socket: ${oldSocketId}, New socket: ${socket.id}`);
      
      // Clean up old socket
      if (userSockets.has(oldSocketId)) {
        userSockets.delete(oldSocketId);
      }
    }
    
    // Store new connection mappings
    activeUsers.set(userId, socket.id);
    userSockets.set(socket.id, userId);
    onlineUsers.add(userId);
    
    // Join user to their own room for easier message delivery
    socket.join(userId);
    
    console.log(`User ${userId} is now online with socket ${socket.id}`);
    console.log('Current online users:', Array.from(onlineUsers));
    
    // Broadcast updated online users list to ALL clients
    broadcastOnlineUsers();
    
    // Send confirmation to the user who just came online
    socket.emit('user_status_confirmed', { 
      userId, 
      status: 'online',
      onlineUsers: Array.from(onlineUsers)
    });
  });

  // User goes offline
  socket.on('user_offline', (userId) => {
    console.log(`User ${userId} requesting to go offline`);
    
    if (!userId) {
      console.log('Invalid userId provided for offline');
      return;
    }
    
    // Remove user from online status
    if (activeUsers.get(userId) === socket.id) {
      activeUsers.delete(userId);
      onlineUsers.delete(userId);
      userSockets.delete(socket.id);
      
      // Leave user room
      socket.leave(userId);
      
      console.log(`User ${userId} went offline`);
      console.log('Remaining online users:', Array.from(onlineUsers));
      
      // Broadcast updated online users list
      broadcastOnlineUsers();
    }
  });

  // Handle request for online users list
  socket.on('get_online_users', () => {
    console.log('Client requested online users list');
    const onlineUsersList = Array.from(onlineUsers);
    socket.emit('online_users', onlineUsersList);
  });

  // Handle sending messages
  socket.on('send_message', (messageData) => {
    console.log('Message received via socket:', messageData);
    
    // Get receiver ID (handle both object and string formats)
    const receiverId = messageData.receiver?._id || messageData.receiver;
    const senderId = messageData.sender?._id || messageData.sender;
    
    console.log(`Attempting to send message from ${senderId} to ${receiverId}`);
    
    // Send to specific user if they're online using room
    if (onlineUsers.has(receiverId)) {
      io.to(receiverId).emit('receive_message', messageData);
      console.log(`Message delivered to online user ${receiverId}`);
    } else {
      console.log(`User ${receiverId} is offline, message not delivered in real-time`);
    }
    
    // Send confirmation back to sender
    socket.emit('message_sent', {
      ...messageData,
      delivered: onlineUsers.has(receiverId),
      timestamp: new Date()
    });
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { receiverId, userId } = data;
    console.log(`Typing indicator from ${userId} to ${receiverId}`);
    
    if (receiverId && onlineUsers.has(receiverId)) {
      io.to(receiverId).emit('user_typing', {
        userId: userId
      });
    }
  });

  // Handle stop typing
  socket.on('stop_typing', (data) => {
    const { receiverId, userId } = data;
    
    if (receiverId && onlineUsers.has(receiverId)) {
      io.to(receiverId).emit('user_stop_typing', {
        userId: userId
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`Socket ${socket.id} disconnected. Reason: ${reason}`);
    
    // Find and remove user from active users and online status
    const disconnectedUserId = userSockets.get(socket.id);
    
    if (disconnectedUserId) {
      console.log(`Cleaning up for disconnected user: ${disconnectedUserId}`);
      
      // Only remove if this socket was the active one for this user
      if (activeUsers.get(disconnectedUserId) === socket.id) {
        activeUsers.delete(disconnectedUserId);
        onlineUsers.delete(disconnectedUserId);
        
        console.log(`User ${disconnectedUserId} went offline due to disconnect`);
        console.log('Remaining online users after disconnect:', Array.from(onlineUsers));
        
        // Broadcast updated online users list
        broadcastOnlineUsers();
      }
      
      userSockets.delete(socket.id);
    }
  });

  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.log('Socket connection error:', error);
  });

  // Handle socket errors
  socket.on('error', (error) => {
    console.log('Socket error:', error);
  });

  // Send initial online users list when client connects
  socket.emit('online_users', Array.from(onlineUsers));
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})