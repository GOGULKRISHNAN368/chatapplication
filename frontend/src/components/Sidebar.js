import React, { useState } from 'react';
import { Search, Users, User, UserPlus, LogOut, Circle } from 'lucide-react';

function Sidebar({ 
  currentUser, 
  contacts, 
  selectedContact, 
  onSelectContact, 
  onLogout,
  onAddContact,
  onCreateGroup,
  onlineUsers 
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
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
          <button 
            onClick={onLogout} 
            className="hover:bg-indigo-700 p-2 rounded-lg transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Search */}
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

      {/* Action Buttons */}
      <div className="flex gap-2 p-3 border-b border-gray-200">
        <button
          onClick={onAddContact}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <UserPlus size={18} />
          <span className="text-sm font-medium">Add Contact</span>
        </button>
        <button
          onClick={onCreateGroup}
          className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition-colors"
        >
          <Users size={18} />
          <span className="text-sm font-medium">New Group</span>
        </button>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No contacts found
          </div>
        ) : (
          filteredContacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
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
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;