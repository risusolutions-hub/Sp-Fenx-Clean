import React from 'react';
import { Plus, Edit2, Trash2, Ban, Unlock, User, Mail, Shield, ToggleLeft, ToggleRight, MoreVertical } from 'lucide-react';

export default function TeamView({ users, user, onNewUser, onEditUser, onDeleteUser, onBlockUser, setModal }) {
  const ROLES = ['engineer', 'manager', 'admin', 'superadmin'];
  const canManage = (actorRole, targetRole) => {
    if (!actorRole || !targetRole) return false;
    return ROLES.indexOf(actorRole) > ROLES.indexOf(targetRole);
  };

  const getRoleBadge = (role) => {
    const styles = {
      superadmin: 'bg-rose-50 text-rose-600 border-rose-100',
      admin: 'bg-amber-50 text-amber-600 border-amber-100',
      manager: 'bg-primary-50 text-primary-600 border-primary-100',
      engineer: 'bg-success-50 text-success-600 border-success-100'
    };
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${styles[role] || 'bg-neutral-50 text-neutral-500 border-neutral-100'}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="fade-in space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-black text-neutral-800 tracking-tight">Access Control</h2>
          <p className="text-neutral-500 font-medium mt-1">Manage organizational hierarchy and permissions</p>
        </div>
        
        <div className="flex items-center gap-3">
          {user?.role !== 'engineer' && (
            <button 
              onClick={() => setModal('complaint')}
              className="p-3 bg-white border border-primary-100 text-primary-600 rounded-xl hover:bg-primary-50 transition-all active:scale-95 shadow-sm flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" />
              <span>Log Incident</span>
            </button>
          )}
          {canManage(user?.role, 'manager') && (
            <button 
              onClick={onNewUser}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-200/50 transition-all active:scale-95 flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" />
              <span>Enlist User</span>
            </button>
          )}
        </div>
      </div>

      <div className="glass-card overflow-hidden border-primary-50/50">
        <div className="p-6 border-b border-primary-50/50 bg-neutral-50/30 flex items-center gap-3">
          <div className="w-2 h-8 bg-primary-500 rounded-full" />
          <h3 className="font-extrabold text-neutral-800 tracking-tight text-lg">Workforce Directory</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Identity</th>
                <th className="px-8 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Clearance</th>
                <th className="px-8 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-4 text-right text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50/30">
              {users.map((targetUser) => (
                <tr key={targetUser.id} className="group hover:bg-primary-50/30 transition-all duration-300">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/5 flex items-center justify-center text-primary-600 font-black text-xs border border-primary-100 shadow-sm">
                        {targetUser.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-neutral-800 leading-none mb-1">{targetUser.name}</span>
                        <div className="flex items-center gap-1.5 text-neutral-400">
                          <Mail size={10} className="opacity-50" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{targetUser.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {getRoleBadge(targetUser.role)}
                  </td>
                  <td className="px-8 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      targetUser.status === 'active' 
                        ? 'bg-success-50 text-success-600' 
                        : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${targetUser.status === 'active' ? 'bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-neutral-400'}`} />
                      {targetUser.status || 'Active'}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    {canManage(user?.role, targetUser.role) ? (
                      <div className="flex gap-2 justify-end items-center">
                        <button 
                          onClick={() => onEditUser(targetUser)} 
                          className="p-2.5 hover:bg-white text-neutral-400 hover:text-primary-600 rounded-xl transition-all hover:shadow-sm active:scale-90 border border-transparent hover:border-primary-100"
                          title="Modify Credentials"
                        >
                           <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteUser(targetUser.id)} 
                          className="p-2.5 hover:bg-white text-neutral-400 hover:text-error-600 rounded-xl transition-all hover:shadow-sm active:scale-90 border border-transparent hover:border-error-100"
                          title="Purge Identity"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                        {(user?.role === 'admin' || user?.role === 'superadmin') && (
                          targetUser.status === 'active'
                            ? <button onClick={() => onBlockUser(targetUser.id, true)} className="p-2.5 hover:bg-white text-neutral-400 hover:text-amber-600 rounded-xl transition-all hover:shadow-sm active:scale-90 border border-transparent hover:border-amber-100" title="Revoke Access"><Ban className="w-4 h-4" /></button>
                            : <button onClick={() => onBlockUser(targetUser.id, false)} className="p-2.5 hover:bg-white text-neutral-400 hover:text-success-600 rounded-xl transition-all hover:shadow-sm active:scale-90 border border-transparent hover:border-success-100" title="Restore Access"><Unlock className="w-4 h-4" /></button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.2em] px-2 italic">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
