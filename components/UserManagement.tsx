
import React, { useState, useEffect, useMemo } from 'react';
import { DataService } from '../services/dataService';
import { User, UserRole, UserStatus, PerformanceStats, Timeframe } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showPerfModal, setShowPerfModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [perfData, setPerfData] = useState<{stats: PerformanceStats, trend: any[] } | null>(null);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    email: '',
    password: '',
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

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openPerfModal = (user: User) => {
    const stats = DataService.getPerformanceStats(user.id);
    const trend = DataService.getSalesTrendData('daily', user.id);
    setPerfData({ stats, trend });
    setSelectedUser(user);
    setShowPerfModal(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      password: '' // Keep empty to indicate no change unless typed
    });
    setShowModal(true);
  };

  const handleExportEmployeeSales = () => {
    if (!selectedUser) return;
    const orders = DataService.getSalesOrders().filter(o => o.userId === selectedUser.id && o.status === 'APPROVED');
    const headers = ["Order ID", "Items", "Amount(INR)", "Fulfilled At"];
    const rows = orders.map(o => [
      o.id, o.items.length, o.totalAmount, new Date(o.createdAt).toLocaleDateString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `${selectedUser.username}_Sales_Performance.csv`);
    link.click();
  };

  const closeModals = () => {
    setShowModal(false);
    setShowPerfModal(false);
    setSelectedUser(null);
    setPerfData(null);
    setFormData({ username: '', email: '', password: '', role: UserRole.USER, status: UserStatus.ACTIVE });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      // Create a clean payload, only including password if it's not empty
      const payload: Partial<User> = { ...formData };
      if (!payload.password) delete payload.password;
      
      DataService.updateUser(selectedUser.id, payload);
    } else {
      DataService.saveUser(formData as Omit<User, 'id' | 'createdAt' | 'lastLogin'>);
    }
    refreshUsers();
    closeModals();
  };

  const toggleStatus = (user: User) => {
    const nextStatus = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    DataService.updateUser(user.id, { status: nextStatus });
    refreshUsers();
  };

  const handleDelete = (id: string) => {
    if (confirm('Permanently remove this user?')) {
      DataService.deleteUser(id);
      refreshUsers();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Registry</h1>
          <p className="text-sm text-slate-500 mt-1">Workforce control and performance evaluation</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg transition-all active:scale-95"
        >
          Initialize New Account
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">User Identity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Access Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Fulfillment Data</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-white text-sm">
                        {u.username[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{u.username}</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase">{u.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${u.status === UserStatus.ACTIVE ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                      <span className={`text-[10px] font-black uppercase ${u.status === UserStatus.ACTIVE ? 'text-green-600' : 'text-slate-400'}`}>
                        {u.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openPerfModal(u)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                    >
                      <span>📈</span> View Stats
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button 
                      onClick={() => handleEdit(u)} 
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Edit Account"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => toggleStatus(u)} 
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Toggle Status"
                    >
                      🚫
                    </button>
                    <button 
                      onClick={() => handleDelete(u.id)} 
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete Account"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Drill-Down Modal */}
      {showPerfModal && selectedUser && perfData && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-10 flex flex-col md:flex-row gap-10">
              <div className="md:w-64 space-y-6">
                <div className="w-24 h-24 rounded-3xl bg-indigo-600 text-white flex items-center justify-center text-4xl font-black shadow-xl shadow-indigo-500/20">
                  {selectedUser.username[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{selectedUser.username}</h3>
                  <p className="text-sm font-medium text-slate-400">{selectedUser.email}</p>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Fulfilled</p>
                    <p className="text-lg font-black text-slate-900">₹{perfData.stats.totalSales.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Deal Velocity</p>
                    <p className="text-lg font-black text-slate-900">{perfData.stats.orderCount} <span className="text-[10px] opacity-40 uppercase">Units</span></p>
                  </div>
                </div>
                <button 
                  onClick={handleExportEmployeeSales}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                >
                  Download Report (CSV)
                </button>
              </div>
              <div className="flex-grow space-y-8">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Live Sales Trajectory</h4>
                  <button onClick={closeModals} className="text-slate-400 hover:text-slate-900 text-3xl">×</button>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={perfData.trend}>
                      <defs>
                        <linearGradient id="empTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                      <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                      <Area type="monotone" dataKey="amount" stroke="#4f46e5" fillOpacity={1} fill="url(#empTrend)" strokeWidth={4} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Average Deal Ticket</p>
                    <p className="text-xl font-black text-indigo-900">₹{Math.round(perfData.stats.avgOrderValue).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Items Dispatched</p>
                    <p className="text-xl font-black text-emerald-900">{perfData.stats.totalQuantity}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">
                    {selectedUser ? 'New Security Password (Optional)' : 'Security Password'}
                  </label>
                  <input 
                    required={!selectedUser} 
                    type="password" 
                    placeholder={selectedUser ? "Leave blank to keep current" : "••••••••"} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                  {selectedUser && (
                    <p className="text-[10px] text-slate-400 mt-1.5 italic">Provide a new password only if you wish to override the current one.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">System Role</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                    >
                      <option value={UserRole.USER}>Standard User</option>
                      <option value={UserRole.ADMIN}>System Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Access Status</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                <button type="button" onClick={closeModals} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95">Cancel</button>
                <button type="submit" className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                  {selectedUser ? 'Commit Changes' : 'Initialize Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
