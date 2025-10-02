const User = require('../models/User');
const Message = require('../models/Message');
const Group = require('../models/Group');

const onlineUsers = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);
    
    socket.on('user_online', async (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit('user_status_changed', { userId, isOnline: true });
    });
    
    socket.on('send_message', async (data) => {
      try {
        const message = new Message({
          senderId: data.senderId,
          recipientId: data.recipientId,
          groupId: data.groupId,
          text: data.text,
          replyTo: data.replyTo
        });
        
        await message.save();
        
        if (data.recipientId) {
          const recipientSocketId = onlineUsers.get(data.recipientId);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('message_received', message);
            message.status = 'delivered';
            await message.save();
            socket.emit('message_status_update', {
              messageId: message._id,
              status: 'delivered'
            });
          }
        }
        
        if (data.groupId) {
          const group = await Group.findById(data.groupId);
          group.members.forEach(memberId => {
            const memberSocketId = onlineUsers.get(memberId.toString());
            if (memberSocketId && memberId.toString() !== data.senderId) {
              io.to(memberSocketId).emit('message_received', message);
            }
          });
        }
        
        socket.emit('message_sent', message);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    socket.on('typing', (data) => {
      const recipientSocketId = onlineUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_typing', {
          userId: data.senderId,
          isTyping: data.isTyping
        });
      }
    });
    
    socket.on('message_read', async (data) => {
      try {
        await Message.updateMany(
          { _id: { $in: data.messageIds } },
          { status: 'read' }
        );
        
        const senderSocketId = onlineUsers.get(data.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages_read', {
            messageIds: data.messageIds,
            readBy: data.readBy
          });
        }
      } catch (error) {
        console.error('Error updating message status:', error);
      }
    });
    
    socket.on('disconnect', async () => {
      console.log('❌ User disconnected:', socket.id);
      
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date()
        });
        
        io.emit('user_status_changed', {
          userId: socket.userId,
          isOnline: false,
          lastSeen: new Date()
        });
      }
    });
  });
};