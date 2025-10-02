import React from 'react';
import { Users, User, Menu } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

function ChatWindow({ 
  selectedContact, 
  currentUser,
  messages,
  onSendMessage,
  onReply,
  onEdit,
  onDelete,
  replyTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  isTyping,
  onlineUsers,
  onToggleSidebar
}) {
  if (!selectedContact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Users className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-semibold text-gray-600">Select a chat to start messaging</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
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

      {/* Messages */}
      <MessageList 
        messages={messages}
        currentUser={currentUser}
        selectedContact={selectedContact}
        onReply={onReply}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Input */}
      <MessageInput 
        onSendMessage={onSendMessage}
        replyTo={replyTo}
        onCancelReply={onCancelReply}
        editingMessage={editingMessage}
        onCancelEdit={onCancelEdit}
      />
    </div>
  );
}

export default ChatWindow;