
import React, { useState, useEffect, useMemo } from 'react';
import { DataService } from '../services/dataService';
import { InventoryRecord } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports: React.FC = () => {
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  useEffect(() => {
    setRecords(DataService.getRecords());
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(records.map(r => r.category));
    return ['All', ...Array.from(cats)];
  }, [records]);

  // Filtered Data for Table/Charts
  const filteredData = useMemo(() => {
    return records.filter(r => {
      if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
      return true;
    });
  }, [records, categoryFilter]);

  // Chart Data: Category Distribution
  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredData.forEach(r => {
      data[r.category] = (data[r.category] || 0) + 1;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // Chart Data: Value by Category
  const valueData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredData.forEach(r => {
      data[r.category] = (data[r.category] || 0) + (r.quantity * r.unitPrice);
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // Trend Data (Mocking historical entries based on lastUpdated)
  const trendData = useMemo(() => {
    // In a real app, this would query a transaction log
    const grouped: Record<string, number> = {};
    records.forEach(r => {
      const date = new Date(r.lastUpdated).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      grouped[date] = (grouped[date] || 0) + 1;
    });
    return Object.entries(grouped).map(([name, entries]) => ({ name, entries }));
  }, [records]);

  const handleExportCSV = () => {
    const headers = ["Item Name", "Category", "Quantity", "Price(INR)", "Total Value(INR)", "Last Updated", "Location"];
    const rows = filteredData.map(r => [
      r.itemName,
      r.category,
      r.quantity,
      r.unitPrice,
      (r.quantity * r.unitPrice).toFixed(2),
      new Date(r.lastUpdated).toLocaleDateString(),
      r.location
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NexGen_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:bg-white">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800">Business Analytics</h1>
          <p className="text-sm text-slate-500">Comprehensive overview of inventory assets and movements</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            📊 Excel (CSV)
          </button>
          <button 
            onClick={handlePrintPDF}
            className="flex-1 md:flex-none px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            🖨️ Export PDF
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center print:hidden">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timeframe</span>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['daily', 'weekly', 'monthly'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                  timeframe === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</span>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Total Asset Valuation</p>
            <h3 className="text-3xl font-black">₹{filteredData.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0).toLocaleString('en-IN')}</h3>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold bg-white/10 w-fit px-2 py-1 rounded">
              <span>ACTIVE ASSETS: {filteredData.length}</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:scale-110 transition-transform">💰</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stock Health Index</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-slate-800">
              {Math.round((filteredData.filter(r => r.status === 'In Stock').length / (filteredData.length || 1)) * 100)}%
            </h3>
            <span className="text-[10px] font-bold text-green-600 mb-1">STABLE</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
            <div 
              className="bg-green-500 h-full rounded-full" 
              style={{ width: `${(filteredData.filter(r => r.status === 'In Stock').length / (filteredData.length || 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Critical Alerts</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-red-600">
              {filteredData.filter(r => r.status === 'Low Stock' || r.status === 'Out of Stock').length}
            </h3>
            <span className="text-[10px] font-bold text-slate-500 mb-1">ITEMS NEED RESTOCK</span>
          </div>
          <div className="mt-4 flex gap-1">
            {filteredData.filter(r => r.status !== 'In Stock').slice(0, 5).map((r, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-8">Asset Update Frequency</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip />
                <Area type="monotone" dataKey="entries" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEntries)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-8">Category Allocation</h3>
          <div className="h-64 flex">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Report Details Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Granular Asset Report</h3>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">MATCHING RECORDS: {filteredData.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Asset Item</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit Cost</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Value</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-800">{record.itemName}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-tighter">{record.location}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">{record.category}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600">₹{record.unitPrice.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-900">₹{(record.quantity * record.unitPrice).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-[9px] font-black px-2 py-1 rounded-md ${
                      record.status === 'In Stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {record.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center pb-12 print:hidden">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Report Generated: {new Date().toLocaleString('en-IN')} • System Authorized Node
        </p>
      </div>

      {/* Print-only View Enhancement */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .rounded-2xl { border-radius: 0 !important; }
          .shadow-sm, .shadow-xl { box-shadow: none !important; }
          table { width: 100% !important; page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          header { padding-top: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
