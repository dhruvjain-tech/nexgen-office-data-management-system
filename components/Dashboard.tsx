
import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { DashboardStats, InventoryRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Simulate loading for better UX
      await new Promise(resolve => setTimeout(resolve, 600));
      const dataRecords = DataService.getRecords();
      setRecords(dataRecords);
      setStats(DataService.getStats());
      setLoading(false);
    };
    loadData();
  }, []);

  const chartData = records.slice(0, 10).map(r => ({
    name: r.itemName,
    quantity: r.quantity
  }));

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium animate-pulse">Synchronizing Core Modules...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Inventory', value: stats.totalRecords, icon: '📦', color: 'blue' },
          { label: 'Added Today', value: stats.todayEntries, icon: '➕', color: 'green' },
          { label: 'Stock Alerts', value: stats.lowStockItems, icon: '⚠️', color: 'amber' },
          { label: 'Asset Valuation', value: `₹${stats.totalValue.toLocaleString('en-IN')}`, icon: '💰', color: 'indigo' },
        ].map((stat, i) => (
          <div 
            key={i} 
            className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-blue-500 outline-none"
            tabIndex={0}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
              </div>
              <span className={`text-xl md:text-2xl p-2 bg-${stat.color}-50 rounded-lg`} aria-hidden="true">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Main Chart */}
        <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-800">Top 10 Stock Levels</h3>
              <p className="text-xs text-slate-400">Inventory volume by item</p>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-widest">Live Feed</span>
          </div>
          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={40}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="quantity" radius={[4, 4, 0, 0]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.quantity < 10 ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
