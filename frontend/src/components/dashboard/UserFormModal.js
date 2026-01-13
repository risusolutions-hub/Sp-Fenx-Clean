import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function UserFormModal({ currentUser, userToEdit, onClose, onCreate, onUpdate }) {
  const isEditMode = !!userToEdit;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'engineer',
  });

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        password: '',
        role: userToEdit.role,
      });
    }
  }, [isEditMode, userToEdit]);

  const ROLES = ['engineer', 'manager', 'admin', 'superadmin'];
  const availableRoles = ROLES.filter(r => ROLES.indexOf(currentUser.role) > ROLES.indexOf(r));

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = { ...formData };
    if (isEditMode && !dataToSend.password) {
      delete dataToSend.password; // Don't send empty password on update
    }
    if (isEditMode) {
      onUpdate(userToEdit.id, dataToSend);
    } else {
      onCreate(dataToSend);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex z-50 items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{isEditMode ? 'Edit User Record' : 'Create New User'}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              required 
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Password {isEditMode && <span className="text-slate-400 font-normal">(Leave blank to keep unchanged)</span>}</label>
             <input 
               type="password" 
               value={formData.password} 
               onChange={e => setFormData({...formData, password: e.target.value})} 
               required={!isEditMode} 
               className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
             />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role <span className="text-red-500">*</span></label>
            <select 
               value={formData.role} 
               onChange={e => setFormData({...formData, role: e.target.value})} 
               required 
               className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             >
              {availableRoles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
             <button 
               type="button" 
               onClick={onClose}
               className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
             >
               Cancel
             </button>
             <button 
               type="submit" 
               className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
             >
               {isEditMode ? 'Update User' : 'Create User'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}