import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Users, User, Edit2, Trash2, Reply, Check, CheckCheck, Circle, Menu, X, UserPlus, LogOut } from 'lucide-react';

// Mock Socket.io functionality (in real app, use actual socket.io-client)
class MockSocket {
  constructor() {
    this.listeners = {};
  }
  
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  
  emit(event, data) {
    console.log('Socket emit:', event, data);
    setTimeout(() => {
      if (event === 'send_message') {
        this.trigger('message_received', { ...data, status: 'delivered' });
      }
    }, 100);
  }
  
  trigger(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

const socket = new MockSocket();

function ChatApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactId, setNewContactId] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      const demoContacts = [
        { 
          id: 'user123', 
          name: 'John Doe', 
          uniqueId: 'JD-8901', 
          isOnline: true, 
          lastSeen: new Date(), 
          isGroup: false 
        },
        { 
          id: 'user456', 
          name: 'Jane Smith', 
          uniqueId: 'JS-5672', 
          isOnline: false, 
          lastSeen: new Date(Date.now() - 3600000), 
          isGroup: false 
        },
        { 
          id: 'group789', 
          name: 'Team Project', 
          uniqueId: 'TP-3421', 
          members: ['user123', 'user456'], 
          isGroup: true 
        }
      ];
      setContacts(demoContacts);
      
      const demoMessages = {
        'user123': [
          { id: 'm1', senderId: 'user123', text: 'Hey! How are you?', timestamp: new Date(Date.now() - 3600000), status: 'read' },
          { id: 'm2', senderId: currentUser.id, text: 'I am good! Thanks for asking.', timestamp: new Date(Date.now() - 3000000), status: 'read' }
        ]
      };
      setMessages(demoMessages);
      
      setOnlineUsers({ 'user123': true, 'user456': false });
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      socket.on('message_received', (msg) => {
        setMessages(prev => ({
          ...prev,
          [msg.contactId]: [...(prev[msg.contactId] || []), msg]
        }));
      });
      
      socket.on('user_typing', ({ userId, isTyping: typing }) => {
        setIsTyping(prev => ({ ...prev, [userId]: typing }));
      });
      
      socket.on('user_online', ({ userId, isOnline }) => {
        setOnlineUsers(prev => ({ ...prev, [userId]: isOnline }));
      });
      
      socket.on('message_status_update', ({ messageId, status }) => {
        setMessages(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(contactId => {
            updated[contactId] = updated[contactId].map(msg =>
              msg.id === messageId ? { ...msg, status } : msg
            );
          });
          return updated;
        });
      });
    }
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedContact]);

  const handleAuth = () => {
    if (isLogin) {
      const user = {
        id: 'currentUser',
        email,
        name: email.split('@')[0],
        uniqueId: 'CU-' + Math.floor(1000 + Math.random() * 9000)
      };
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      const user = {
        id: 'user_' + Date.now(),
        email,
        name,
        uniqueId: name.substring(0, 2).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000)
      };
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !selectedContact) return;
    
    const newMessage = {
      id: 'm_' + Date.now(),
      senderId: currentUser.id,
      text: inputMessage,
      timestamp: new Date(),
      status: 'sent',
      replyTo: replyTo ? replyTo.id : null
    };
    
    if (editingMessage) {
      setMessages(prev => ({
        ...prev,
        [selectedContact.id]: prev[selectedContact.id].map(msg =>
          msg.id === editingMessage.id ? { ...msg, text: inputMessage, edited: true } : msg
        )
      }));
      setEditingMessage(null);
    } else {
      setMessages(prev => ({
        ...prev,
        [selectedContact.id]: [...(prev[selectedContact.id] || []), newMessage]
      }));
      
      socket.emit('send_message', {
        contactId: selectedContact.id,
        message: newMessage
      });
    }
    
    setInputMessage('');
    setReplyTo(null);
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    socket.emit('typing', { contactId: selectedContact.id, isTyping: true });
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { contactId: selectedContact.id, isTyping: false });
    }, 1000);
  };

  const deleteMessage = (msgId, deleteForEveryone = false) => {
    setMessages(prev => ({
      ...prev,
      [selectedContact.id]: prev[selectedContact.id].map(msg =>
        msg.id === msgId
          ? { ...msg, deleted: true, deletedForEveryone: deleteForEveryone }
          : msg
      )
    }));
    
    if (deleteForEveryone) {
      socket.emit('delete_message', { messageId: msgId, contactId: selectedContact.id });
    }
  };

  const addContact = () => {
    if (!newContactId.trim()) return;
    
    const newContact = {
      id: 'user_' + Date.now(),
      name: newContactId,
      uniqueId: newContactId,
      isOnline: false,
      lastSeen: new Date(),
      isGroup: false
    };
    
    setContacts(prev => [...prev, newContact]);
    setShowAddContact(false);
    setNewContactId('');
  };

  const createGroup = () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;
    
    const newGroup = {
      id: 'group_' + Date.now(),
      name: groupName,
      uniqueId: groupName.substring(0, 2).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000),
      members: selectedMembers,
      isGroup: true
    };
    
    setContacts(prev => [...prev, newGroup]);
    setShowGroupModal(false);
    setGroupName('');
    setSelectedMembers([]);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.uniqueId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">ChatConnect</h1>
            <p className="text-gray-600 mt-2">Connect instantly with anyone</p>
          </div>
          
          <div>
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <button
              onClick={handleAuth}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
          </div>
          
          <p className="text-center mt-6 text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 font-semibold hover:underline"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`${showSidebar ? 'w-80' : 'w-0'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden`}>
        <div className="bg-indigo-600 text-white p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <User className="text-indigo-600" size={24} />
              </div>
              <div>
                <h2 className="font-semibold">{currentUser.name}</h2>
                <p className="text-xs opacity-90">ID: {currentUser.uniqueId}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="hover:bg-indigo-700 p-2 rounded-lg transition-colors">
              <LogOut size={20} />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 text-indigo-300" size={18} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-indigo-700 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>

        <div className="flex gap-2 p-3 border-b border-gray-200">
          <button
            onClick={() => setShowAddContact(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <UserPlus size={18} />
            <span className="text-sm font-medium">Add Contact</span>
          </button>
          <button
            onClick={() => setShowGroupModal(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Users size={18} />
            <span className="text-sm font-medium">New Group</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedContact?.id === contact.id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    contact.isGroup ? 'bg-green-100' : 'bg-indigo-100'
                  }`}>
                    {contact.isGroup ? (
                      <Users className="text-green-600" size={24} />
                    ) : (
                      <User className="text-indigo-600" size={24} />
                    )}
                  </div>
                  {!contact.isGroup && onlineUsers[contact.id] && (
                    <Circle className="absolute bottom-0 right-0 text-green-500 fill-green-500" size={12} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{contact.name}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    {contact.isGroup ? `${contact.members?.length || 0} members` : contact.uniqueId}
                  </p>
                  {!contact.isGroup && !onlineUsers[contact.id] && contact.lastSeen && (
                    <p className="text-xs text-gray-400">
                      Last seen {new Date(contact.lastSeen).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="lg:hidden hover:bg-gray-100 p-2 rounded-lg"
                >
                  <Menu size={20} />
                </button>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedContact.isGroup ? 'bg-green-100' : 'bg-indigo-100'
                }`}>
                  {selectedContact.isGroup ? (
                    <Users className="text-green-600" size={20} />
                  ) : (
                    <User className="text-indigo-600" size={20} />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">{selectedContact.name}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedContact.isGroup
                      ? `${selectedContact.members?.length || 0} members`
                      : onlineUsers[selectedContact.id]
                      ? 'Online'
                      : 'Offline'}
                  </p>
                  {isTyping[selectedContact.id] && (
                    <p className="text-xs text-indigo-600">typing...</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {(messages[selectedContact.id] || []).map(msg => {
                const isOwn = msg.senderId === currentUser.id;
                const replyToMsg = msg.replyTo
                  ? messages[selectedContact.id]?.find(m => m.id === msg.replyTo)
                  : null;

                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md ${isOwn ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800'} rounded-lg p-3 shadow-sm`}>
                      {replyToMsg && (
                        <div className={`text-xs mb-2 p-2 rounded ${isOwn ? 'bg-indigo-700' : 'bg-gray-100'} border-l-2 ${isOwn ? 'border-white' : 'border-indigo-600'}`}>
                          <Reply size={12} className="inline mr-1" />
                          {replyToMsg.text}
                        </div>
                      )}
                      
                      {msg.deleted ? (
                        <p className="italic opacity-70">
                          {msg.deletedForEveryone ? 'This message was deleted' : 'You deleted this message'}
                        </p>
                      ) : (
                        <>
                          <p className="break-words">{msg.text}</p>
                          {msg.edited && <span className="text-xs opacity-70 ml-2">(edited)</span>}
                        </>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                        
                        {isOwn && !msg.deleted && (
                          <div className="flex items-center gap-2">
                            {msg.status === 'sent' && <Check size={14} />}
                            {msg.status === 'delivered' && <CheckCheck size={14} />}
                            {msg.status === 'read' && <CheckCheck size={14} className="text-blue-300" />}
                            
                            <button
                              onClick={() => setReplyTo(msg)}
                              className="hover:opacity-70"
                            >
                              <Reply size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingMessage(msg);
                                setInputMessage(msg.text);
                              }}
                              className="hover:opacity-70"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete for everyone?')) {
                                  deleteMessage(msg.id, true);
                                } else {
                                  deleteMessage(msg.id, false);
                                }
                              }}
                              className="hover:opacity-70"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              {replyTo && (
                <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Reply size={16} />
                    <span>Replying to: {replyTo.text}</span>
                  </div>
                  <button onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-gray-700">
                    <X size={16} />
                  </button>
                </div>
              )}
              
              {editingMessage && (
                <div className="mb-2 p-2 bg-blue-100 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Edit2 size={16} />
                    <span>Editing message</span>
                  </div>
                  <button onClick={() => { setEditingMessage(null); setInputMessage(''); }} className="text-blue-600 hover:text-blue-800">
                    <X size={16} />
                  </button>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={handleTyping}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={sendMessage}
                  className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Users className="mx-auto text-gray-400 mb-4" size={64} />
              <h2 className="text-2xl font-semibold text-gray-600">Select a chat to start messaging</h2>
            </div>
          </div>
        )}
      </div>

      {showAddContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Contact</h2>
            <input
              type="text"
              placeholder="Enter unique ID (e.g., JD-8901)"
              value={newContactId}
              onChange={(e) => setNewContactId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2">
              <button
                onClick={addContact}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                Add Contact
              </button>
              <button
                onClick={() => { setShowAddContact(false); setNewContactId(''); }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-sm text-gray-600 mb-2">Select members:</p>
            <div className="max-h-48 overflow-y-auto mb-4 space-y-2">
              {contacts.filter(c => !c.isGroup).map(contact => (
                <label key={contact.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(contact.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers([...selectedMembers, contact.id]);
                      } else {
                        setSelectedMembers(selectedMembers.filter(id => id !== contact.id));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span>{contact.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={createGroup}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Create Group
              </button>
              <button
                onClick={() => { setShowGroupModal(false); setGroupName(''); setSelectedMembers([]); }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatApp;