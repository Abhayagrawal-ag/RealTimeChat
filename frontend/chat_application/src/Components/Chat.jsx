


// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import io from 'socket.io-client';

// const Chat = () => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [socket, setSocket] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [isMobileView, setIsMobileView] = useState(false);
//   const [showSidebar, setShowSidebar] = useState(true);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const messagesEndRef = useRef(null);

//   // Configure axios defaults
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     }
//   }, []);

//   // Handle responsive design
//   useEffect(() => {
//     const handleResize = () => {
//       const width = window.innerWidth;
//       setIsMobileView(width < 768);
//       if (width < 768) {
//         setShowSidebar(false);
//       } else {
//         setShowSidebar(true);
//       }
//     };

//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   // Initialize user and socket
//   useEffect(() => {
//     const initializeApp = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         const token = localStorage.getItem('token');
//         if (!token) {
//           setError('No authentication token found');
//           window.location.href = '/signin';
//           return;
//         }

//         console.log('Initializing app with token:', token ? 'Present' : 'Missing');

//         // Get current user first
//         try {
//           const userResponse = await axios.get('http://localhost:3000/api/messages/me');
//           console.log('Current user response:', userResponse.data);
          
//           if (userResponse.data.user) {
//             setCurrentUser(userResponse.data.user);
            
//             // Initialize socket connection after getting user
//             const newSocket = io('http://localhost:3000', {
//               withCredentials: true,
//               transports: ['websocket', 'polling']
//             });
            
//             setSocket(newSocket);
            
//             // Emit user_connected event
//             newSocket.emit('user_connected', userResponse.data.user._id);
//             console.log('Socket connected for user:', userResponse.data.user._id);
            
//             // Fetch users
//             try {
//               const usersResponse = await axios.get('http://localhost:3000/api/messages/users');
//               console.log('Users response:', usersResponse.data);
              
//               if (usersResponse.data.users) {
//                 setUsers(usersResponse.data.users);
//               } else {
//                 setUsers([]);
//               }
//             } catch (usersError) {
//               console.error('Error fetching users:', usersError);
//               if (usersError.response?.status === 401 || usersError.response?.status === 403) {
//                 localStorage.removeItem('token');
//                 window.location.href = '/signin';
//                 return;
//               }
//               setError('Failed to load users');
//             }
            
//             return newSocket;
//           } else {
//             throw new Error('No user data received');
//           }
//         } catch (userError) {
//           console.error('Error getting current user:', userError);
//           if (userError.response?.status === 401 || userError.response?.status === 403) {
//             localStorage.removeItem('token');
//             window.location.href = '/signin';
//             return;
//           }
//           throw userError;
//         }
//       } catch (error) {
//         console.error('App initialization error:', error);
//         setError('Failed to initialize app: ' + error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const cleanup = initializeApp();
    
//     return () => {
//       cleanup.then(socket => {
//         if (socket) {
//           socket.close();
//         }
//       });
//     };
//   }, []);

//   // Listen for socket events
//   useEffect(() => {
//     if (socket && currentUser) {
//       const handleReceiveMessage = (messageData) => {
//         console.log('Received message:', messageData);
//         if (
//           (messageData.sender._id === selectedUser?._id && messageData.receiver._id === currentUser._id) ||
//           (messageData.receiver._id === selectedUser?._id && messageData.sender._id === currentUser._id)
//         ) {
//           setMessages(prev => {
//             // Check if message already exists to avoid duplicates
//             const exists = prev.some(msg => msg._id === messageData._id);
//             if (!exists) {
//               return [...prev, messageData];
//             }
//             return prev;
//           });
//         }
//       };

//       const handleUserTyping = (data) => {
//         if (data.userId === selectedUser?._id) {
//           setIsTyping(true);
//           setTimeout(() => setIsTyping(false), 2000);
//         }
//       };

//       const handleMessageSent = (messageData) => {
//         console.log('Message sent confirmation:', messageData);
//       };

//       socket.on('receive_message', handleReceiveMessage);
//       socket.on('user_typing', handleUserTyping);
//       socket.on('message_sent', handleMessageSent);

//       return () => {
//         socket.off('receive_message', handleReceiveMessage);
//         socket.off('user_typing', handleUserTyping);
//         socket.off('message_sent', handleMessageSent);
//       };
//     }
//   }, [socket, selectedUser, currentUser]);

//   // Fetch messages when user is selected
//   useEffect(() => {
//     const fetchMessages = async () => {
//       if (selectedUser && currentUser) {
//         try {
//           console.log('Fetching messages for user:', selectedUser._id);
//           const response = await axios.get(`http://localhost:3000/api/messages/${selectedUser._id}`);
//           console.log('Messages response:', response.data);
          
//           if (response.data.messages) {
//             setMessages(response.data.messages);
//           } else {
//             setMessages([]);
//           }
//         } catch (error) {
//           console.error('Error fetching messages:', error);
//           if (error.response?.status === 401 || error.response?.status === 403) {
//             localStorage.removeItem('token');
//             window.location.href = '/signin';
//           }
//         }
//       }
//     };

//     fetchMessages();
//   }, [selectedUser, currentUser]);

//   // Scroll to bottom of messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const sendMessage = async (e) => {
//     e.preventDefault();
//     if (!newMessage.trim() || !selectedUser || !currentUser) return;

//     try {
//       console.log('Sending message:', {
//         receiver: selectedUser._id,
//         content: newMessage.trim()
//       });

//       const messageData = {
//         receiver: selectedUser._id,
//         content: newMessage.trim()
//       };

//       const response = await axios.post('http://localhost:3000/api/messages', messageData);
//       console.log('Message sent response:', response.data);

//       if (response.data.message) {
//         // Emit message through socket
//         if (socket) {
//           socket.emit('send_message', response.data.message);
//         }
        
//         // Add message to local state
//         setMessages(prev => [...prev, response.data.message]);
//         setNewMessage('');
//       }
//     } catch (error) {
//       console.error('Error sending message:', error);
//       if (error.response?.status === 401 || error.response?.status === 403) {
//         localStorage.removeItem('token');
//         window.location.href = '/signin';
//       }
//     }
//   };

//   const handleTyping = () => {
//     if (socket && selectedUser && currentUser) {
//       socket.emit('typing', {
//         receiverId: selectedUser._id,
//         userId: currentUser._id
//       });
//     }
//   };

//   const formatTime = (timestamp) => {
//     try {
//       return new Date(timestamp).toLocaleTimeString([], {
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch (error) {
//       return '';
//     }
//   };

//   const filteredUsers = users.filter(user =>
//     user.username?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const getLastMessage = (user) => {
//     const userMessages = messages.filter(msg => 
//       (msg.sender?._id === user._id) || (msg.receiver?._id === user._id)
//     );
//     return userMessages[userMessages.length - 1];
//   };

//   const handleUserSelect = (user) => {
//     setSelectedUser(user);
//     if (isMobileView) {
//       setShowSidebar(false);
//     }
//   };

//   const handleBackToUsers = () => {
//     if (isMobileView) {
//       setShowSidebar(true);
//     }
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p>Loading chat...</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
//         <div className="text-center">
//           <div className="text-red-500 mb-4">
//             <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </div>
//           <p className="text-red-400 mb-4">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
//       {/* Sidebar - Responsive */}
//       <div className={`
//         ${isMobileView 
//           ? `fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`
//           : 'relative'
//         }
//         ${isMobileView ? 'w-full' : 'w-full md:w-1/3 lg:w-1/4 min-w-0 flex-shrink-0'}
//         bg-gray-800 border-r border-gray-700 flex flex-col
//         ${!isMobileView && !showSidebar ? 'hidden' : ''}
//       `}>
//         {/* Header */}
//         <div className="p-3 sm:p-4 border-b border-gray-700">
//           <div className="flex items-center justify-between mb-3 sm:mb-4">
//             <h1 className="text-lg sm:text-xl font-bold">Chats</h1>
//             {isMobileView && (
//               <button
//                 onClick={() => setShowSidebar(false)}
//                 className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             )}
//           </div>
//           {currentUser && (
//             <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 truncate">Welcome, {currentUser.username}!</p>
//           )}
          
//           {/* Search */}
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search users"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full bg-gray-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg pl-9 sm:pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//             />
//             <svg className="absolute left-2 sm:left-3 top-2 sm:top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//         </div>

//         {/* Messages Section */}
//         <div className="p-3 sm:p-4 border-b border-gray-700">
//           <h2 className="text-xs sm:text-sm font-semibold text-gray-400 mb-3">
//             Messages ({filteredUsers.length} users)
//           </h2>
//         </div>

//         {/* Users List */}
//         <div className="flex-1 overflow-y-auto">
//           {filteredUsers.length === 0 ? (
//             <div className="p-4 text-center text-gray-400 text-sm">
//               {users.length === 0 ? 'No users available' : 'No users match your search'}
//             </div>
//           ) : (
//             filteredUsers.map((user) => {
//               const lastMessage = getLastMessage(user);
//               return (
//                 <div
//                   key={user._id}
//                   onClick={() => handleUserSelect(user)}
//                   className={`flex items-center p-3 sm:p-4 hover:bg-gray-700 cursor-pointer transition-colors ${
//                     selectedUser?._id === user._id ? 'bg-gray-700' : ''
//                   }`}
//                 >
//                   <div className="relative flex-shrink-0">
//                     <img
//                       src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}&background=random`}
//                       alt={user.username || 'User'}
//                       className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
//                       onError={(e) => {
//                         e.target.src = `https://ui-avatars.com/api/?name=U&background=6366f1&color=ffffff`;
//                       }}
//                     />
//                     <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
//                   </div>
//                   <div className="ml-3 flex-1 min-w-0">
//                     <div className="flex justify-between items-center">
//                       <h3 className="font-semibold truncate text-sm sm:text-base">{user.username || 'Unknown User'}</h3>
//                       {lastMessage && (
//                         <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
//                           {formatTime(lastMessage.createdAt || lastMessage.timestamp)}
//                         </span>
//                       )}
//                     </div>
//                     <p className="text-xs sm:text-sm text-gray-400 truncate">
//                       {user.email || ''}
//                     </p>
//                     {lastMessage && (
//                       <p className="text-xs text-gray-400 truncate mt-1">
//                         {lastMessage.content}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       </div>

//       {/* Chat Area */}
//       <div className={`
//         flex-1 flex flex-col min-w-0
//         ${isMobileView && showSidebar ? 'hidden' : ''}
//       `}>
//         {selectedUser ? (
//           <>
//             {/* Chat Header */}
//             <div className="bg-gray-800 p-3 sm:p-4 border-b border-gray-700 flex items-center">
//               {isMobileView && (
//                 <button
//                   onClick={handleBackToUsers}
//                   className="mr-3 p-1 hover:bg-gray-700 rounded-lg transition-colors"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                   </svg>
//                 </button>
//               )}
//               <img
//                 src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.username || 'User')}&background=random`}
//                 alt={selectedUser.username || 'User'}
//                 className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
//                 onError={(e) => {
//                   e.target.src = `https://ui-avatars.com/api/?name=U&background=6366f1&color=ffffff`;
//                 }}
//               />
//               <div className="ml-3 min-w-0">
//                 <h2 className="font-semibold text-sm sm:text-base truncate">{selectedUser.username || 'Unknown User'}</h2>
//                 <p className="text-xs sm:text-sm text-green-400">Online</p>
//               </div>
//             </div>

//             {/* Messages */}
//             <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
//               {messages.length === 0 ? (
//                 <div className="text-center text-gray-400 mt-8">
//                   <p className="text-sm sm:text-base">No messages yet. Start the conversation!</p>
//                 </div>
//               ) : (
//                 messages.map((message, index) => {
//                   const isCurrentUser = message.sender?._id === currentUser?._id;
//                   return (
//                     <div
//                       key={message._id || index}
//                       className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
//                     >
//                       <div
//                         className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 py-2 sm:px-4 sm:py-2 rounded-lg ${
//                           isCurrentUser
//                             ? 'bg-blue-600 text-white'
//                             : 'bg-gray-700 text-white'
//                         }`}
//                       >
//                         <p className="text-sm break-words">{message.content}</p>
//                         <p className={`text-xs mt-1 ${
//                           isCurrentUser ? 'text-blue-200' : 'text-gray-400'
//                         }`}>
//                           {formatTime(message.createdAt || message.timestamp)}
//                         </p>
//                       </div>
//                     </div>
//                   );
//                 })
//               )}
//               {isTyping && (
//                 <div className="flex justify-start">
//                   <div className="bg-gray-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg">
//                     <div className="flex space-x-1">
//                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
//                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Message Input */}
//             <div className="p-3 sm:p-4 border-t border-gray-700">
//               <form onSubmit={sendMessage} className="flex items-center space-x-2">
//                 <input
//                   type="text"
//                   value={newMessage}
//                   onChange={(e) => {
//                     setNewMessage(e.target.value);
//                     handleTyping();
//                   }}
//                   placeholder="Type your message..."
//                   className="flex-1 bg-gray-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                 />
//                 <button
//                   type="submit"
//                   disabled={!newMessage.trim()}
//                   className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-2 rounded-lg transition-colors"
//                 >
//                   <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//                   </svg>
//                 </button>
//               </form>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center p-4">
//             <div className="text-center">
//               <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                 </svg>
//               </div>
//               <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-2">Welcome to Chat</h3>
//               <p className="text-sm text-gray-400">
//                 {isMobileView ? 'Tap a conversation to start messaging' : 'Select a conversation to start messaging'}
//               </p>
//               {isMobileView && (
//                 <button
//                   onClick={() => setShowSidebar(true)}
//                   className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
//                 >
//                   View Conversations
//                 </button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Mobile Sidebar Overlay */}
//       {isMobileView && showSidebar && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-40"
//           onClick={() => setShowSidebar(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default Chat;


import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isUserActive, setIsUserActive] = useState(true); // Track if user is active in chat
  const messagesEndRef = useRef(null);

  // Configure axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobileView(width < 768);
      if (width < 768) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle user activity and online/offline status
  useEffect(() => {
    let activityTimer;

    const resetActivityTimer = () => {
      if (activityTimer) clearTimeout(activityTimer);
      
      // Set user as active
      if (!isUserActive && socket && currentUser) {
        setIsUserActive(true);
        socket.emit('user_online', currentUser._id);
        console.log('User is now active/online');
      }

      // Set timer to mark user as inactive after 5 minutes of no activity
      activityTimer = setTimeout(() => {
        if (socket && currentUser) {
          setIsUserActive(false);
          socket.emit('user_offline', currentUser._id);
          console.log('User is now inactive/offline due to inactivity');
        }
      }, 5 * 60 * 1000); // 5 minutes
    };

    const handleUserActivity = () => {
      resetActivityTimer();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched to another tab/minimized
        if (socket && currentUser && isUserActive) {
          setIsUserActive(false);
          socket.emit('user_offline', currentUser._id);
          console.log('User went offline - tab hidden');
        }
        if (activityTimer) clearTimeout(activityTimer);
      } else {
        // User came back to the chat tab
        if (socket && currentUser && !isUserActive) {
          setIsUserActive(true);
          socket.emit('user_online', currentUser._id);
          console.log('User came back online - tab visible');
        }
        resetActivityTimer();
      }
    };

    const handleBeforeUnload = () => {
      if (socket && currentUser) {
        socket.emit('user_offline', currentUser._id);
        console.log('User going offline - page unload');
      }
    };

    // Only set up activity tracking if user and socket are available
    if (currentUser && socket) {
      // Start the activity timer
      resetActivityTimer();

      // Listen for user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {
        document.addEventListener(event, handleUserActivity, { passive: true });
      });

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        if (activityTimer) clearTimeout(activityTimer);
        
        events.forEach(event => {
          document.removeEventListener(event, handleUserActivity);
        });
        
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);

        // Emit offline status when component unmounts
        if (socket && currentUser) {
          socket.emit('user_offline', currentUser._id);
        }
      };
    }
  }, [socket, currentUser, isUserActive]);

  // Initialize user and socket
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          window.location.href = '/signin';
          return;
        }

        console.log('Initializing app with token:', token ? 'Present' : 'Missing');

        // Get current user first
        try {
          const userResponse = await axios.get('http://localhost:3000/api/messages/me');
          console.log('Current user response:', userResponse.data);
          
          if (userResponse.data.user) {
            setCurrentUser(userResponse.data.user);
            
            // Initialize socket connection after getting user
            const newSocket = io('http://localhost:3000', {
              withCredentials: true,
              transports: ['websocket', 'polling']
            });
            
            setSocket(newSocket);
            
            // Don't emit user_online here - let the activity tracker handle it
            console.log('Socket connected for user:', userResponse.data.user._id);
            
            // Fetch users
            try {
              const usersResponse = await axios.get('http://localhost:3000/api/messages/users');
              console.log('Users response:', usersResponse.data);
              
              if (usersResponse.data.users) {
                setUsers(usersResponse.data.users);
              } else {
                setUsers([]);
              }
            } catch (usersError) {
              console.error('Error fetching users:', usersError);
              if (usersError.response?.status === 401 || usersError.response?.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/signin';
                return;
              }
              setError('Failed to load users');
            }
            
            return newSocket;
          } else {
            throw new Error('No user data received');
          }
        } catch (userError) {
          console.error('Error getting current user:', userError);
          if (userError.response?.status === 401 || userError.response?.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/signin';
            return;
          }
          throw userError;
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setError('Failed to initialize app: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    const cleanup = initializeApp();
    
    return () => {
      cleanup.then(socket => {
        if (socket) {
          socket.close();
        }
      });
    };
  }, []);

  // Listen for socket events
  useEffect(() => {
    if (socket && currentUser) {
      const handleReceiveMessage = (messageData) => {
        console.log('Received message:', messageData);
        if (
          (messageData.sender._id === selectedUser?._id && messageData.receiver._id === currentUser._id) ||
          (messageData.receiver._id === selectedUser?._id && messageData.sender._id === currentUser._id)
        ) {
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(msg => msg._id === messageData._id);
            if (!exists) {
              return [...prev, messageData];
            }
            return prev;
          });
        }
      };

      const handleUserTyping = (data) => {
        if (data.userId === selectedUser?._id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 2000);
        }
      };

      const handleMessageSent = (messageData) => {
        console.log('Message sent confirmation:', messageData);
      };

      // Handle online users updates
      const handleUserOnline = (userId) => {
        console.log('User came online:', userId);
        setOnlineUsers(prev => new Set([...prev, userId]));
      };

      const handleUserOffline = (userId) => {
        console.log('User went offline:', userId);
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      };

      const handleOnlineUsersList = (usersList) => {
        console.log('Online users list:', usersList);
        setOnlineUsers(new Set(usersList));
      };

      socket.on('receive_message', handleReceiveMessage);
      socket.on('user_typing', handleUserTyping);
      socket.on('message_sent', handleMessageSent);
      socket.on('user_online', handleUserOnline);
      socket.on('user_offline', handleUserOffline);
      socket.on('online_users', handleOnlineUsersList);

      // Request current online users list when socket connects
      socket.emit('get_online_users');

      return () => {
        socket.off('receive_message', handleReceiveMessage);
        socket.off('user_typing', handleUserTyping);
        socket.off('message_sent', handleMessageSent);
        socket.off('user_online', handleUserOnline);
        socket.off('user_offline', handleUserOffline);
        socket.off('online_users', handleOnlineUsersList);
      };
    }
  }, [socket, selectedUser, currentUser]);

  // Fetch messages when user is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser && currentUser) {
        try {
          console.log('Fetching messages for user:', selectedUser._id);
          const response = await axios.get(`http://localhost:3000/api/messages/${selectedUser._id}`);
          console.log('Messages response:', response.data);
          
          if (response.data.messages) {
            setMessages(response.data.messages);
          } else {
            setMessages([]);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/signin';
          }
        }
      }
    };

    fetchMessages();
  }, [selectedUser, currentUser]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !currentUser) return;

    try {
      console.log('Sending message:', {
        receiver: selectedUser._id,
        content: newMessage.trim()
      });

      const messageData = {
        receiver: selectedUser._id,
        content: newMessage.trim()
      };

      const response = await axios.post('http://localhost:3000/api/messages', messageData);
      console.log('Message sent response:', response.data);

      if (response.data.message) {
        // Emit message through socket
        if (socket) {
          socket.emit('send_message', response.data.message);
        }
        
        // Add message to local state
        setMessages(prev => [...prev, response.data.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/signin';
      }
    }
  };

  const handleTyping = () => {
    if (socket && selectedUser && currentUser) {
      socket.emit('typing', {
        receiverId: selectedUser._id,
        userId: currentUser._id
      });
    }
  };

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLastMessage = (user) => {
    const userMessages = messages.filter(msg => 
      (msg.sender?._id === user._id) || (msg.receiver?._id === user._id)
    );
    return userMessages[userMessages.length - 1];
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    if (isMobileView) {
      setShowSidebar(false);
    }
  };

  const handleBackToUsers = () => {
    if (isMobileView) {
      setShowSidebar(true);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar - Responsive */}
      <div className={`
        ${isMobileView 
          ? `fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`
          : 'relative'
        }
        ${isMobileView ? 'w-full' : 'w-full md:w-1/3 lg:w-1/4 min-w-0 flex-shrink-0'}
        bg-gray-800 border-r border-gray-700 flex flex-col
        ${!isMobileView && !showSidebar ? 'hidden' : ''}
      `}>
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h1 className="text-lg sm:text-xl font-bold">Chats</h1>
            {isMobileView && (
              <button
                onClick={() => setShowSidebar(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {currentUser && (
            <div className="flex items-center mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-400 truncate">Welcome, {currentUser.username}!</p>
              <div className={`ml-2 w-2 h-2 rounded-full ${isUserActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              <span className="ml-1 text-xs text-gray-400">
                {isUserActive ? 'Online' : 'Away'}
              </span>
            </div>
          )}
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg pl-9 sm:pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <svg className="absolute left-2 sm:left-3 top-2 sm:top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Messages Section */}
        <div className="p-3 sm:p-4 border-b border-gray-700">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-400 mb-3">
            Messages ({filteredUsers.length} users)
          </h2>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              {users.length === 0 ? 'No users available' : 'No users match your search'}
            </div>
          ) : (
            filteredUsers.map((user) => {
              const lastMessage = getLastMessage(user);
              const isOnline = isUserOnline(user._id);
              return (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className={`flex items-center p-3 sm:p-4 hover:bg-gray-700 cursor-pointer transition-colors ${
                    selectedUser?._id === user._id ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}&background=random`}
                      alt={user.username || 'User'}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=U&background=6366f1&color=ffffff`;
                      }}
                    />
                    {/* Online/Offline Status Indicator */}
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-gray-800 ${
                      isOnline ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold truncate text-sm sm:text-base">{user.username || 'Unknown User'}</h3>
                      {lastMessage && (
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatTime(lastMessage.createdAt || lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 truncate">
                      {user.email || ''}
                    </p>
                    {lastMessage && (
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`
        flex-1 flex flex-col min-w-0
        ${isMobileView && showSidebar ? 'hidden' : ''}
      `}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-gray-800 p-3 sm:p-4 border-b border-gray-700 flex items-center">
              {isMobileView && (
                <button
                  onClick={handleBackToUsers}
                  className="mr-3 p-1 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <img
                src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.username || 'User')}&background=random`}
                alt={selectedUser.username || 'User'}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=U&background=6366f1&color=ffffff`;
                }}
              />
              <div className="ml-3 min-w-0">
                <h2 className="font-semibold text-sm sm:text-base truncate">{selectedUser.username || 'Unknown User'}</h2>
                <p className={`text-xs sm:text-sm ${
                  isUserOnline(selectedUser._id) ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {isUserOnline(selectedUser._id) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                  <p className="text-sm sm:text-base">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isCurrentUser = message.sender?._id === currentUser?._id;
                  return (
                    <div
                      key={message._id || index}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 py-2 sm:px-4 sm:py-2 rounded-lg ${
                          isCurrentUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-white'
                        }`}
                      >
                        <p className="text-sm break-words">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-blue-200' : 'text-gray-400'
                        }`}>
                          {formatTime(message.createdAt || message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 sm:p-4 border-t border-gray-700">
              <form onSubmit={sendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-2">Welcome to Chat</h3>
              <p className="text-sm text-gray-400">
                {isMobileView ? 'Tap a conversation to start messaging' : 'Select a conversation to start messaging'}
              </p>
              {isMobileView && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  View Conversations
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileView && showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
};

export default Chat;


