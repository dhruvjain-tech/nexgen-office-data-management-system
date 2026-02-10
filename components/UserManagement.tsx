
import React, { useState, useEffect, useMemo } from 'react';
import { DataService } from '../services/dataService';
import { User, UserRole, UserStatus } from '../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const itemsPerPage = 5;

  // Form State
  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    email: '',
    role: UserRole.USER,
    status: UserStatus.ACTIVE
  });

  useEffect(() => {
    refreshUsers();
  }, []);

  const refreshUsers = () => {
    setUsers(DataService.getUsers());
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      DataService.updateUser(selectedUser.id, formData);
    } else {
      DataService.saveUser(formData as Omit<User, 'id' | 'createdAt' | 'lastLogin'>);
    }
    refreshUsers();
    closeModals();
  };

  const handleDelete = (id: string) => {
    if (confirm('Permanently remove this user from the system?')) {
      DataService.deleteUser(id);
      refreshUsers();
    }
  };

  const toggleStatus = (user: User) => {
    const nextStatus = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    DataService.updateUser(user.id, { status: nextStatus });
    refreshUsers();
  };

  const openResetModal = (user: User) => {
    setSelectedUser(user);
    setShowResetModal(true);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && newPassword) {
      DataService.updateUser(selectedUser.id, { password: newPassword });
      alert(`Password for ${selectedUser.username} has been reset successfully.`);
      closeModals();
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setShowModal(true);
  };

  const closeModals = () => {
    setShowModal(false);
    setShowResetModal(false);
    setSelectedUser(null);
    setNewPassword('');
    setFormData({ username: '', email: '', role: UserRole.USER, status: UserStatus.ACTIVE });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Registry</h1>
          <p className="text-sm text-slate-500 mt-1">Manage workforce access and administrative roles</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <span>Create New Account</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-3 opacity-40">🔍</span>
        </div>
        <div className="flex-grow"></div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Showing {paginatedUsers.length} of {filteredUsers.length} Users
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">User Information</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Security Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Access Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-blue-600 text-sm border border-slate-200">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{u.username}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                      u.role === UserRole.ADMIN ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${u.status === UserStatus.ACTIVE ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                      <span className={`text-[10px] font-bold ${u.status === UserStatus.ACTIVE ? 'text-green-600' : 'text-slate-400'}`}>
                        {u.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-medium text-slate-500">{u.lastLogin || 'Never'}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button 
                      onClick={() => toggleStatus(u)}
                      title={u.status === UserStatus.ACTIVE ? "Disable Account" : "Enable Account"}
                      className={`p-2 rounded-lg transition-colors ${u.status === UserStatus.ACTIVE ? 'text-slate-400 hover:bg-slate-100' : 'text-green-500 hover:bg-green-50'}`}
                    >
                      {u.status === UserStatus.ACTIVE ? '🚫' : '✅'}
                    </button>
                    <button 
                      onClick={() => openEditModal(u)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit User"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => openResetModal(u)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Reset Password"
                    >
                      🔑
                    </button>
                    <button 
                      onClick={() => handleDelete(u.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-4 py-2 text-xs font-bold text-slate-600 disabled:opacity-30"
          >
            ← Previous
          </button>
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  currentPage === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 text-slate-500'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-4 py-2 text-xs font-bold text-slate-600 disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">{selectedUser ? 'Edit System Account' : 'New System Account'}</h3>
              <button onClick={closeModals} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Full Name / Identifier</label>
                  <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                         value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Corporate Email Address</label>
                  <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                         value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">System Role</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                    >
                      <option value={UserRole.USER}>Standard User</option>
                      <option value={UserRole.ADMIN}>System Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Initial Status</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as UserStatus})}
                    >
                      <option value={UserStatus.ACTIVE}>Active</option>
                      <option value={UserStatus.INACTIVE}>Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={closeModals}
                  className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                >
                  {selectedUser ? 'Update Account' : 'Initialize Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-amber-100">
                🔑
              </div>
              <h3 className="text-xl font-bold text-slate-800">Reset Access</h3>
              <p className="text-sm text-slate-500 mt-2">Update security credentials for <span className="font-bold text-slate-700">{selectedUser.username}</span></p>
              
              <form onSubmit={handlePasswordReset} className="mt-8 space-y-4">
                <input 
                  required
                  type="password" 
                  placeholder="Enter new strong password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/20"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <button 
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg transition-all"
                >
                  Update Credentials
                </button>
                <button 
                  type="button"
                  onClick={closeModals}
                  className="w-full py-3 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"
                >
                  Dismiss
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
