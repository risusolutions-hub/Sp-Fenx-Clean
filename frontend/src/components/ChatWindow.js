import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Paperclip, Smile, X, Search, MoreVertical } from 'lucide-react';
import Loader from './Loader';

export default function ChatWindow({ complaintId, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mentions, setMentions] = useState([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadMessages();
    // Fetch available users for mentions
    fetchUsers();
  }, [complaintId]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include'
      });
      const data = await response.json();
      setAvailableUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/messages?threadType=complaint&complaintId=${complaintId}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          threadType: 'complaint',
          complaintId,
          content: newMessage,
          mentions
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        setNewMessage('');
        setMentions([]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMentionSearch = (text) => {
    if (text.includes('@')) {
      const lastWord = text.split(' ').pop();
      if (lastWord.startsWith('@')) {
        setMentionSearch(lastWord.substring(1));
        setShowMentionSuggestions(true);
      }
    }
  };

  const addMention = (userId, userName) => {
    setNewMessage(newMessage.replace(/@\w+$/, `@${userName}`));
    setMentions([...mentions, userId]);
    setShowMentionSuggestions(false);
    setMentionSearch('');
  };

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  return (
    <div className="fixed bottom-0 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl border border-slate-200 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div>
          <h3 className="font-bold">Ticket Comments</h3>
          <p className="text-xs text-blue-100">Complaint #{complaintId}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-blue-500 rounded transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {loading && !messages.length && <Loader />}

        {messages.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-8">
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.senderId === currentUser.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200'
                }`}
              >
                {msg.senderId !== currentUser.id && (
                  <p className="text-xs font-bold text-slate-600 mb-1">
                    {msg.sender?.name}
                  </p>
                )}
                <p className="text-sm break-words">{msg.content}</p>
                {msg.mentions && msg.mentions.length > 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    mentions: {msg.mentions.join(', ')}
                  </p>
                )}
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 p-3 bg-white rounded-b-lg">
        {showMentionSuggestions && (
          <div className="bg-slate-100 border border-slate-300 rounded mb-2 max-h-32 overflow-y-auto">
            {filteredUsers.map(user => (
              <button
                key={user.id}
                onClick={() => addMention(user.id, user.name)}
                className="w-full text-left px-3 py-2 hover:bg-slate-200 text-sm transition"
              >
                @{user.name}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleMentionSearch(e.target.value);
            }}
            placeholder="Type @ to mention someone..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
