
import React, { useState, useEffect, useMemo } from 'react';
import { DataService } from '../services/dataService';
import { InventoryRecord, Timeframe, PerformanceStats } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area, BarChart, Bar 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports: React.FC = () => {
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly');
  const [viewType, setViewType] = useState<'inventory' | 'performance'>('performance');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [perfStats, setPerfStats] = useState<PerformanceStats | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  
  useEffect(() => {
    setRecords(DataService.getRecords());
    setPerfStats(DataService.getPerformanceStats());
    setTrendData(DataService.getSalesTrendData(timeframe));
  }, [timeframe]);

  const categories = useMemo(() => {
    const cats = new Set(records.map(r => r.category));
    return ['All', ...Array.from(cats)];
  }, [records]);

  const filteredData = useMemo(() => {
    return records.filter(r => {
      if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
      return true;
    });
  }, [records, categoryFilter]);

  const handleExportCSV = () => {
    const headers = viewType === 'inventory' 
      ? ["Item Name", "Category", "Quantity", "Price(INR)", "Total Value(INR)", "Last Updated"]
      : ["Employee Name", "Total Sales(INR)", "Order Count", "Contribution %"];

    let rows: any[] = [];
    
    if (viewType === 'inventory') {
      rows = filteredData.map(r => [
        r.itemName, r.category, r.quantity, r.unitPrice, 
        (r.quantity * r.unitPrice).toFixed(2), new Date(r.lastUpdated).toLocaleDateString()
      ]);
    } else {
      const orders = DataService.getSalesOrders().filter(o => o.status === 'APPROVED');
      const buckets: Record<string, { amount: number, count: number }> = {};
      orders.forEach(o => {
        buckets[o.username] = buckets[o.username] || { amount: 0, count: 0 };
        buckets[o.username].amount += o.totalAmount;
        buckets[o.username].count += 1;
      });
      const total = Object.values(buckets).reduce((acc, c) => acc + c.amount, 0);
      rows = Object.entries(buckets).map(([name, data]) => [
        name, data.amount, data.count, ((data.amount / (total || 1)) * 100).toFixed(1) + '%'
      ]);
    }
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NexGen_${viewType}_Report_${new Date().toISOString().split('T')[0]}.csv`);
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
          <h1 className="text-2xl font-bold text-slate-800">Intelligence Terminal</h1>
          <p className="text-sm text-slate-500">Multidimensional analysis of assets and human performance</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            📊 CSV Export
          </button>
          <button 
            onClick={handlePrintPDF}
            className="flex-1 md:flex-none px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            🖨️ PDF Report
          </button>
        </div>
      </div>

      {/* View Switcher */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex w-fit gap-1 print:hidden">
        <button 
          onClick={() => setViewType('performance')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewType === 'performance' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Performance
        </button>
        <button 
          onClick={() => setViewType('inventory')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewType === 'inventory' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Inventory
        </button>
      </div>

      {viewType === 'performance' && perfStats && (
        <>
          {/* Performance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Fulfilled Value</p>
              <h3 className="text-2xl font-black text-slate-900">₹{perfStats.totalSales.toLocaleString('en-IN')}</h3>
              <div className="mt-3 text-[10px] font-bold text-green-600 flex items-center gap-1">
                <span className="text-xs">↑</span> 14% vs Prev Period
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conversion Count</p>
              <h3 className="text-2xl font-black text-slate-900">{perfStats.orderCount} <span className="text-xs text-slate-400 font-medium">Orders</span></h3>
              <div className="mt-3 text-[10px] font-bold text-indigo-600">High Volume Velocity</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Order Ticket</p>
              <h3 className="text-2xl font-black text-slate-900">₹{Math.round(perfStats.avgOrderValue).toLocaleString('en-IN')}</h3>
              <div className="mt-3 text-[10px] font-bold text-slate-400">Yield per fulfillment</div>
            </div>
            <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">Top Performer</p>
                <h3 className="text-xl font-black truncate">{perfStats.topPerformer?.name || 'N/A'}</h3>
                <p className="text-[10px] font-bold mt-1 opacity-90">₹{perfStats.topPerformer?.amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="absolute -right-2 -bottom-2 text-6xl opacity-20 transition-transform group-hover:scale-110">🏆</div>
            </div>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Revenue Lifecycle Trend</h3>
                <div className="flex bg-slate-50 p-1 rounded-lg">
                  {(['daily', 'weekly', 'monthly', 'yearly'] as Timeframe[]).map(t => (
                    <button 
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${timeframe === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      {t[0]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="amount" stroke="#4f46e5" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-8">Workforce Contribution</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={Object.entries(
                      DataService.getSalesOrders().filter(o => o.status === 'APPROVED')
                      .reduce((acc, o) => {
                        acc[o.username] = (acc[o.username] || 0) + o.totalAmount;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([name, amount]) => ({ name, amount }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {viewType === 'inventory' && (
        <>
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

          {/* Asset Distribution Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Inventory Asset Audit</h3>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-200 text-[10px] font-black uppercase px-4 py-2 rounded-xl outline-none"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Asset Item</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Total Value</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-800">{record.itemName}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5 uppercase">{record.category}</div>
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-bold text-slate-900">₹{(record.quantity * record.unitPrice).toLocaleString('en-IN')}</td>
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
        </>
      )}

      {/* Footer Info */}
      <div className="text-center pb-12 print:hidden">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Consolidated Analysis • {new Date().toLocaleString('en-IN')} • Authorized Admin Terminal
        </p>
      </div>
    </div>
  );
};

export default Reports;
