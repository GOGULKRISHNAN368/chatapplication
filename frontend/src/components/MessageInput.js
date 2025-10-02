import React, { useState } from 'react';
import { Send, Reply, Edit2, X } from 'lucide-react';

function MessageInput({ 
  onSendMessage, 
  replyTo, 
  onCancelReply, 
  editingMessage, 
  onCancelEdit 
}) {
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    
    onSendMessage(inputMessage, replyTo?.id, editingMessage?.id);
    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Set input value when editing
  React.useEffect(() => {
    if (editingMessage) {
      setInputMessage(editingMessage.text);
    }
  }, [editingMessage]);

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {/* Reply Preview */}
      {replyTo && (
        <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Reply size={16} />
            <span className="truncate">Replying to: {replyTo.text}</span>
          </div>
          <button 
            onClick={onCancelReply} 
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Edit Preview */}
      {editingMessage && (
        <div className="mb-2 p-2 bg-blue-100 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Edit2 size={16} />
            <span>Editing message</span>
          </div>
          <button 
            onClick={() => {
              onCancelEdit();
              setInputMessage('');
            }} 
            className="text-blue-600 hover:text-blue-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input Field */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSend}
          disabled={!inputMessage.trim()}
          className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

export default MessageInput;