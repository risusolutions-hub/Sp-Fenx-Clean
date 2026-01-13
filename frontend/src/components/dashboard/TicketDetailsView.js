import React, { useState, useEffect } from 'react';
import { 
  X, ArrowLeft, Clock, User, MessageSquare, CheckCircle2, AlertCircle,
  ArrowRight, Paperclip, Send, Loader, Calendar, Shield, MapPin, 
  HelpCircle, Zap, Activity, MessageCircle
} from 'lucide-react';
import api from '../../api';

export default function TicketDetailsView({ ticketId, onClose, user, isPanel = false }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comments, setComments] = useState([]);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    if (ticketId) loadTicketDetails();
  }, [ticketId]);

  const loadTicketDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/complaints/${ticketId}/details`);
      if (res.data.success) {
        setTicket(res.data.ticket);
        setComments(res.data.comments || []);
        setTimeline(res.data.timeline || []);
      }
    } catch (err) {
      console.error('Error loading ticket details:', err);
      setError('System could not retrieve incident data cluster.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await api.post(`/complaints/${ticketId}/comments`, {
        content: commentText.trim()
      });
      
      if (res.data.success) {
        setComments([...comments, res.data.comment]);
        setCommentText('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const getPriorityInfo = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return { icon: AlertCircle, color: 'text-error-600', ring: 'ring-error-100', bg: 'bg-error-50' };
      case 'high': return { icon: Zap, color: 'text-amber-600', ring: 'ring-amber-100', bg: 'bg-amber-50' };
      case 'medium': return { icon: Activity, color: 'text-primary-600', ring: 'ring-primary-100', bg: 'bg-primary-50' };
      default: return { icon: HelpCircle, color: 'text-neutral-500', ring: 'ring-neutral-100', bg: 'bg-neutral-50' };
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-neutral-100 text-neutral-600';
      case 'assigned': return 'bg-primary-50 text-primary-600';
      case 'in_progress': return 'bg-amber-50 text-amber-600';
      case 'resolved': return 'bg-success-50 text-success-600';
      case 'closed': return 'bg-neutral-800 text-white';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  if (loading) {
    const LoaderUI = (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Decrypting File Structure...</p>
      </div>
    );
    return isPanel ? LoaderUI : <div className="fixed inset-0 bg-white/40 backdrop-blur-xl z-[60] flex items-center justify-center">{LoaderUI}</div>;
  }

  if (error || !ticket) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-error-400 mx-auto" />
        <h3 className="text-sm font-black text-neutral-800 uppercase tracking-widest">Incident Not Found</h3>
        <p className="text-xs text-neutral-400 max-w-xs mx-auto">{error || "Cluster data corrupted or missing."}</p>
        <button onClick={onClose} className="px-6 py-2 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Return to Dashboard</button>
      </div>
    );
  }

  const Priority = getPriorityInfo(ticket.priority);

  const Content = (
    <div className={`flex flex-col h-full bg-white/70 backdrop-blur-md ${!isPanel ? 'max-w-5xl w-full mx-auto rounded-3xl shadow-2xl border border-white overflow-hidden' : ''}`}>
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white flex items-center justify-between">
        <div className="flex items-center gap-5">
          {!isPanel && (
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Incident Context</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              {ticket.complaintId}
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-tighter ${getStatusStyle(ticket.status)}`}>
                {ticket.status?.replace('_', ' ')}
              </span>
            </h2>
          </div>
        </div>
        <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-xl transition-all">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
        {/* Core Description */}
        <div className="glass-card p-8 border-primary-100 bg-primary-50/10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
             <MessageSquare size={120} />
           </div>
           <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-4">Initial Assessment</h3>
           <p className="text-lg font-black text-neutral-800 leading-tight mb-2">{ticket.problem}</p>
           <p className="text-sm text-neutral-500 font-medium leading-relaxed">{ticket.description || "No extended description provided."}</p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="glass-card p-5 group hover:border-primary-200 transition-all">
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-3">Originator</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-neutral-800">{ticket.creator?.name || 'External System'}</p>
                  <p className="text-[10px] text-neutral-500 font-medium">{ticket.customer?.name}</p>
                </div>
              </div>
           </div>

           <div className="glass-card p-5 group hover:border-amber-200 transition-all">
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-3">Assigned Operative</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-neutral-800">{ticket.engineer?.name || 'Unassigned'}</p>
                  <p className="text-[10px] text-neutral-500 font-medium">{ticket.engineer?.role || 'Awaiting Allocation'}</p>
                </div>
              </div>
           </div>

           <div className="glass-card p-5">
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-3">Priority Vector</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${Priority.bg} flex items-center justify-center ${Priority.color} ring-1 ${Priority.ring}`}>
                  <Priority.icon size={20} />
                </div>
                <p className={`text-xs font-black uppercase tracking-widest ${Priority.color}`}>{ticket.priority}</p>
              </div>
           </div>

           <div className="glass-card p-5">
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-3">Time in Cluster</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500">
                  <Clock size={20} />
                </div>
                <div>
                   <p className="text-xs font-black text-neutral-800">
                     {Math.floor((new Date() - new Date(ticket.createdAt)) / (1000 * 60 * 60 * 24))} Days
                   </p>
                   <p className="text-[10px] text-neutral-500 font-medium">Since Ingestion</p>
                </div>
              </div>
           </div>
        </div>

        {/* Resolution Path */}
        {ticket.solutionNotes && (
          <div className="glass-card p-8 border-success-100 bg-success-50/10">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 size={20} className="text-success-500" />
              <h3 className="text-[10px] font-black text-success-600 uppercase tracking-widest">Resolution Summary</h3>
            </div>
            <p className="text-sm font-medium text-neutral-700 leading-relaxed whitespace-pre-wrap">{ticket.solutionNotes}</p>
          </div>
        )}

        {/* Intelligence Feed (Comments) */}
        <div className="space-y-6">
           <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-black text-neutral-800 tracking-tight">Intelligence Feed</h3>
              <span className="px-3 py-1 bg-neutral-100 rounded-lg text-[10px] font-black text-neutral-400 uppercase">{comments.length} Entries</span>
           </div>

           <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-10 opacity-30">
                  <MessageSquare size={32} className="mx-auto mb-3" />
                  <p className="text-xs font-black uppercase tracking-widest">No communication logs recorded</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-50 flex-shrink-0 flex items-center justify-center text-neutral-400 shadow-sm border border-neutral-100">
                      <User size={18} />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <h4 className="text-xs font-black text-neutral-800 tracking-tight">{comment.sender?.name || 'OPERATIVE'}</h4>
                           {comment.sender?.role && (
                             <span className="text-[8px] font-black px-1.5 py-0.5 bg-primary-50 text-primary-500 rounded uppercase border border-primary-100/50">{comment.sender.role}</span>
                           )}
                         </div>
                         <span className="text-[10px] font-bold text-neutral-400">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="bg-neutral-50/50 border border-neutral-100 p-4 rounded-2xl rounded-tl-none group-hover:bg-white transition-all shadow-sm group-hover:shadow-md">
                        <p className="text-sm text-neutral-600 font-medium leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
           </div>

           {/* Ingestion Console (Comment Form) */}
           <div className="pt-6">
              <div className="glass-card p-6 bg-neutral-900 border-neutral-800">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-neutral-800 rounded-lg text-primary-500">
                      <Activity size={16} />
                    </div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Ingest Analysis</h4>
                 </div>
                 <form onSubmit={handleAddComment} className="space-y-4">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Input intelligence entry..."
                      className="w-full bg-neutral-800 border-none text-white placeholder-neutral-500 text-sm font-medium rounded-2xl p-4 focus:ring-2 focus:ring-primary-500/50 transition-all outline-none min-h-[100px] resize-none"
                      disabled={submittingComment}
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingComment || !commentText.trim()}
                        className="flex items-center gap-3 px-8 py-3 bg-primary-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-900/20"
                      >
                        {submittingComment ? <Loader size={12} className="animate-spin" /> : <Send size={12} />}
                        {submittingComment ? 'Synchronizing...' : 'Transmit entry'}
                      </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  if (isPanel) return Content;

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[100] p-4 md:p-10 flex items-center justify-center animate-fade-in overflow-y-auto">
      <div className="w-full h-full lg:h-auto animate-slide-up-mod">
        {Content}
      </div>
    </div>
  );
}
