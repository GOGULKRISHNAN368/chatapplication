import React, { useRef, useEffect } from 'react';
import { Reply, Edit2, Trash2, Check, CheckCheck } from 'lucide-react';

function MessageList({ messages, currentUser, selectedContact, onReply, onEdit, onDelete }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getReplyMessage = (replyToId) => {
    return messages.find(m => m.id === replyToId);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map(msg => {
          const isOwn = msg.senderId === currentUser.id;
          const replyToMsg = msg.replyTo ? getReplyMessage(msg.replyTo) : null;

          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md ${isOwn ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800'} rounded-lg p-3 shadow-sm`}>
                {/* Reply Preview */}
                {replyToMsg && (
                  <div className={`text-xs mb-2 p-2 rounded ${isOwn ? 'bg-indigo-700' : 'bg-gray-100'} border-l-2 ${isOwn ? 'border-white' : 'border-indigo-600'}`}>
                    <Reply size={12} className="inline mr-1" />
                    <span className="opacity-80">{replyToMsg.text}</span>
                  </div>
                )}

                {/* Message Content */}
                {msg.deleted ? (
                  <p className="italic opacity-70">
                    {msg.deletedForEveryone ? 'This message was deleted' : 'You deleted this message'}
                  </p>
                ) : (
                  <>
                    {selectedContact.isGroup && !isOwn && (
                      <p className="text-xs font-semibold mb-1 opacity-80">
                        {msg.senderName || 'Unknown'}
                      </p>
                    )}
                    <p className="break-words">{msg.text}</p>
                    {msg.edited && <span className="text-xs opacity-70 ml-2">(edited)</span>}
                  </>
                )}

                {/* Message Footer */}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>

                  {/* Actions for own messages */}
                  {isOwn && !msg.deleted && (
                    <div className="flex items-center gap-2">
                      {/* Read Status */}
                      {msg.status === 'sent' && <Check size={14} />}
                      {msg.status === 'delivered' && <CheckCheck size={14} />}
                      {msg.status === 'read' && <CheckCheck size={14} className="text-blue-300" />}

                      {/* Reply */}
                      <button
                        onClick={() => onReply(msg)}
                        className="hover:opacity-70"
                        title="Reply"
                      >
                        <Reply size={14} />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEdit(msg)}
                        className="hover:opacity-70"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          const deleteForEveryone = window.confirm(
                            'Delete for everyone? Click Cancel to delete for you only.'
                          );
                          onDelete(msg.id, deleteForEveryone);
                        }}
                        className="hover:opacity-70"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;