import React, { useState, useEffect } from 'react';

function ChatSystem({ users, onSendMessage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      setIsLoading(true);
      // Simulate fetching messages
      setTimeout(() => {
        setMessages([ // Example messages
          { sender: 'User1', content: 'Hello!' },
          { sender: selectedUser.username, content: 'Hi there!' }
        ]);
        setIsLoading(false);
      }, 1000);
    }
  }, [selectedUser]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = { sender: 'You', content: newMessage };
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
      onSendMessage(selectedUser, message);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-system">
      <div className="user-list">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul>
          {filteredUsers.map((user) => (
            <li
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={selectedUser?.id === user.id ? 'selected' : ''}
            >
              {user.username}
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-window">
        {selectedUser ? (
          <>
            <h2>Chat with {selectedUser.username}</h2>
            <div className="messages">
              {isLoading ? (
                <div className="skeleton-loader">Loading...</div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.sender === 'You' ? 'sent' : 'received'}`}>
                    <span>{msg.sender}: </span>
                    {msg.content}
                  </div>
                ))
              )}
            </div>
            <div className="message-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div>Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
}

export default ChatSystem;