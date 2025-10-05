# ChatConnect - Real-time Chat Application

A modern, full-stack real-time chat application built with React, Node.js, Socket.io, and MongoDB.

## Features

- **Real-time Messaging** - Instant message delivery using Socket.io
- **User Authentication** - Secure JWT-based authentication
- **One-on-One Chat** - Private conversations between users
- **Group Chat** - Create and manage group conversations
- **Message Features**
  - Reply to messages
  - Edit sent messages
  - Delete messages (for you or everyone)
  - Message read receipts (sent, delivered, read)
- **Online Status** - See who's online in real-time
- **Typing Indicators** - Know when someone is typing
- **Contact Management** - Add contacts using unique ID
- **Responsive Design** - Works seamlessly on desktop and mobile

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Socket.io Client
- Axios
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- Socket.io
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/GOGULKRISHNAN368/chatapplication.git
cd chatapplication
```

### 2. Backend Setup
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
touch .env
```

Add these variables to `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your-super-secret-jwt-key-change-this
CLIENT_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file
touch .env
```

Add these variables to `.env`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Run the Application

**Start Backend:**
```bash
cd backend
npm start
```
Backend runs on http://localhost:5000

**Start Frontend:**
```bash
cd frontend
npm start
```
Frontend runs on http://localhost:3000

## Usage

1. **Register** - Create a new account with name, email, and password
2. **Get Unique ID** - After registration, you'll receive a unique ID (e.g., GO-1234)
3. **Add Contacts** - Use another user's unique ID to add them as a contact
4. **Start Chatting** - Select a contact and start messaging
5. **Create Groups** - Click "New Group" and select multiple contacts

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/contacts` - Get user's contacts
- `POST /api/users/contacts` - Add new contact
- `GET /api/users/search/:uniqueId` - Search user by unique ID

### Messages
- `GET /api/messages/:userId` - Get messages with a user
- `GET /api/messages/group/:groupId` - Get group messages

### Groups
- `POST /api/groups` - Create new group
- `GET /api/groups` - Get user's groups

## Socket Events

### Client Emits
- `user_online` - Notify server user is online
- `send_message` - Send a message
- `edit_message` - Edit a message
- `delete_message` - Delete a message
- `typing` - Send typing indicator
- `message_read` - Mark messages as read

### Server Emits
- `message_received` - New message received
- `message_sent` - Message sent confirmation
- `message_edited` - Message was edited
- `message_deleted` - Message was deleted
- `message_status_update` - Message status changed
- `user_typing` - User is typing
- `user_status_changed` - User online/offline status

## Deployment

### Deploy to Production

1. **MongoDB Atlas** - Set up free cluster at mongodb.com/cloud/atlas
2. **Backend** - Deploy to Railway or Render
3. **Frontend** - Deploy to Vercel or Netlify

Detailed deployment guide available in the repository.

## Project Structure

```
chatapplication/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Message.js
│   │   └── Group.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── messages.js
│   │   └── groups.js
│   ├── middleware/
│   │   └── auth.js
│   ├── socket/
│   │   └── socketHandlers.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.js
│   │   │   ├── Sidebar.js
│   │   │   ├── ChatWindow.js
│   │   │   ├── MessageList.js
│   │   │   ├── MessageInput.js
│   │   │   └── Modals.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Features in Detail

### Message Status
- **Sent** (✓) - Message sent to server
- **Delivered** (✓✓) - Message delivered to recipient
- **Read** (✓✓ blue) - Message read by recipient

### Message Actions
- **Reply** - Reply to any message with context
- **Edit** - Edit your own messages
- **Delete** - Delete for yourself or everyone

### Group Features
- Create groups with multiple members
- Group admin capabilities
- Member list display
- Group messaging with sender names

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Author

**Gogul Krishnan**
- GitHub: [@GOGULKRISHNAN368](https://github.com/GOGULKRISHNAN368)

## Acknowledgments

- Socket.io for real-time communication
- Tailwind CSS for styling
- Lucide React for beautiful icons

## Support

For support, email your-email@example.com or open an issue in the repository.

---

Built with ❤️ using React and Node.js
