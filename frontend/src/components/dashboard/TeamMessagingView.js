import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Users, MessageCircle, User, AtSign, Phone, MoreVertical, Check, CheckCheck, Plus } from 'lucide-react';
import api from '../../api';
import Skeleton from '../ui/Skeleton';

export default function TeamMessagingView({ currentUser, setModal, user }) {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadConversations();
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.userId);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 10 seconds
  useEffect(() => {
    if (!selectedConversation) return;
    const interval = setInterval(() => {
      loadMessages(selectedConversation.userId, true);
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    setConversationsLoading(true);
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  const loadUsers = async (searchQuery = '') => {
    setUsersLoading(true);
    try {
      const res = await api.get(`/users?limit=10&search=${encodeURIComponent(searchQuery)}`);
      setUsers(res.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadMessages = async (otherUserId, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get(`/messages?threadType=direct&otherUserId=${otherUserId}`);
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    // Extract mentions from message
    const mentionMatches = newMessage.match(/@(\w+)/g) || [];
    const mentions = mentionMatches.map(m => {
      const name = m.substring(1);
      const user = users.find(u => u.name.toLowerCase().includes(name.toLowerCase()));
      return user?.id;
    }).filter(Boolean);

    try {
      const res = await api.post('/messages', {
        threadType: 'direct',
        recipientId: selectedConversation.userId,
        content: newMessage,
        mentions
      });

      setMessages([...messages, res.data.message]);
      setNewMessage('');
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startNewConversation = (user) => {
    setSelectedConversation({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role
    });
    setShowNewChat(false);
    setMessages([]);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    // Check for @ mentions
    const lastWord = value.split(' ').pop();
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      setMentionSearch(lastWord.substring(1));
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user) => {
    const words = newMessage.split(' ');
    words[words.length - 1] = `@${user.name} `;
    setNewMessage(words.join(' '));
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const filteredUsers = users.filter(u => 
    u.id !== currentUser?.id && 
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const mentionUsers = users.filter(u =>
    u.name.toLowerCase().includes(mentionSearch.toLowerCase())
  ).slice(0, 5);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-100 text-purple-700';
      case 'admin': return 'bg-red-100 text-red-700';
      case 'manager': return 'bg-blue-100 text-blue-700';
      case 'engineer': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Sidebar - Conversations */}
      <div className="w-80 border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <MessageCircle size={20} className="text-blue-600" />
              Messages
            </h2>
            <div className="flex items-center gap-2">
              {(user?.role !== 'engineer') && (
                <button
                  onClick={() => setModal('complaint')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition text-blue-600"
                  title="Create New Ticket"
                >
                  <Plus size={18} />
                </button>
              )}
              <button
                onClick={() => setShowNewChat(!showNewChat)}
                className="p-2 hover:bg-slate-100 rounded-lg transition text-blue-600"
                title="New conversation"
              >
                <Users size={18} />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations or users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (showNewChat && e.target.value.trim()) {
                  loadUsers(e.target.value);
                } else if (showNewChat) {
                  loadUsers();
                }
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* New Chat Selection */}
        {showNewChat && (
          <div className="border-b border-slate-200 max-h-64 overflow-y-auto">
            <div className="p-3 bg-slate-50 border-b border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Start new conversation</p>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-9 pr-4 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200"
                  onChange={(e) => {
                    const query = e.target.value;
                    if (query.trim()) {
                      loadUsers(query);
                    } else {
                      loadUsers();
                    }
                  }}
                />
              </div>
            </div>
            {users.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => startNewConversation(user)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-blue-50 transition text-left border-b border-slate-100 last:border-b-0"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_,i)=> (
                <div key={i} className="p-3 rounded-md border border-neutral-100 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-full" ariaLabel="loading avatar" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-4 w-3/4 rounded-md mb-1" ariaLabel="loading title" />
                      <Skeleton className="h-3 w-1/2 rounded-md" ariaLabel="loading subtitle" />
                    </div>
                    <Skeleton className="w-12 h-5 rounded-md" ariaLabel="loading role" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <MessageCircle size={40} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Click the users icon to start chatting</p>
            </div>
          ) : (
            conversations
              .filter(c => 
                !searchQuery || 
                c.userName?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(conv => (
                <button
                  key={conv.userId}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition text-left border-b border-slate-100 ${
                    selectedConversation?.userId === conv.userId ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                    {conv.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900 truncate">{conv.userName}</p>
                      <span className="text-xs text-slate-400">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate mt-1">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                  {selectedConversation.userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{selectedConversation.userName}</p>
                  <p className="text-xs text-slate-500">{selectedConversation.userEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(selectedConversation.userRole)}`}>
                  {selectedConversation.userRole}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex w-full">
                      <div className="w-2/3">
                        <Skeleton className="h-3 w-1/2 mb-2 rounded-md" ariaLabel="loading header" />
                        <Skeleton className="h-10 w-full rounded-2xl" ariaLabel="loading message" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm mt-1">Send a message to start the conversation</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => {
                    const isOwn = msg.senderId === currentUser?.id || msg.sender?.id === currentUser?.id;
                    const showDate = idx === 0 || 
                      formatDate(messages[idx - 1].createdAt) !== formatDate(msg.createdAt);

                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <div className="flex items-center justify-center my-4">
                            <span className="text-xs text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm">
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isOwn
                                  ? 'bg-blue-600 text-white rounded-br-md'
                                  : 'bg-white text-slate-900 rounded-bl-md shadow-sm'
                              }`}
                            >
                              {/* Highlight @mentions */}
                              <p className="text-sm whitespace-pre-wrap">
                                {msg.content.split(/(@\w+)/g).map((part, i) => 
                                  part.startsWith('@') ? (
                                    <span key={i} className={`font-bold ${isOwn ? 'text-blue-200' : 'text-blue-600'}`}>
                                      {part}
                                    </span>
                                  ) : part
                                )}
                              </p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                              <span className="text-xs text-slate-400">
                                {formatTime(msg.createdAt)}
                              </span>
                              {isOwn && (
                                msg.readAt ? (
                                  <CheckCheck size={14} className="text-blue-500" />
                                ) : (
                                  <Check size={14} className="text-slate-400" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-200 bg-white relative">
              {/* Mention Suggestions */}
              {showMentions && mentionUsers.length > 0 && (
                <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
                  {mentionUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => insertMention(user)}
                      className="w-full p-2 flex items-center gap-2 hover:bg-blue-50 transition text-left"
                    >
                      <AtSign size={14} className="text-blue-600" />
                      <span className="font-medium text-slate-900">{user.name}</span>
                      <span className="text-xs text-slate-500">({user.role})</span>
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Type a message... (use @ to mention)"
                  className="flex-1 px-4 py-3 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose from existing chats or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
