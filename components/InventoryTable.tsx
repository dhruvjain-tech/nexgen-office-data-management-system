
import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { InventoryRecord, UserRole } from '../types';

interface InventoryTableProps {
  role: UserRole;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ role }) => {
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    quantity: 0,
    unitPrice: 0,
    location: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 400));
      setRecords(DataService.getRecords());
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredRecords = records.filter(r => 
    r.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Permanently delete this inventory record?')) {
      DataService.deleteRecord(id);
      setRecords(DataService.getRecords());
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Name,Category,Quantity,Price(INR),Location,Status", 
         ...records.map(r => `${r.itemName},${r.category},${r.quantity},${r.unitPrice},${r.location},${r.status}`)
        ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "NexGen_Inventory_Data.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    DataService.saveRecord(formData);
    setRecords(DataService.getRecords());
    setShowModal(false);
    setFormData({ itemName: '', category: '', quantity: 0, unitPrice: 0, location: '' });
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="relative w-full lg:w-96">
          <label htmlFor="search-input" className="sr-only">Search inventory</label>
          <input
            id="search-input"
            type="text"
            placeholder="Filter by name or category..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm transition-all"
            value={searchTerm}
            onChange={handleSearch}
          />
          <span className="absolute left-3 top-3.5 opacity-40" aria-hidden="true">🔍</span>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button 
            onClick={handleExport}
            aria-label="Export inventory to CSV"
            className="flex-1 lg:flex-none px-4 py-3 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-slate-300"
          >
            <span>📥</span> Export CSV
          </button>
          {role === UserRole.ADMIN && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex-1 lg:flex-none px-6 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span>➕</span> Add New Record
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Asset Detail</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stock Level</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unit Price</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-8 h-8 border-3 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching Assets...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{record.itemName}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">{record.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[9px] font-black uppercase tracking-tight">
                        {record.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{record.quantity}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">₹{record.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                        record.status === 'In Stock' ? 'bg-green-100 text-green-700' :
                        record.status === 'Low Stock' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 outline-none"
                        aria-label={`View details for ${record.itemName}`}
                      >
                        🔍
                      </button>
                      {role === UserRole.ADMIN && (
                        <button 
                          onClick={() => handleDelete(record.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:ring-2 focus:ring-red-500 outline-none"
                          aria-label={`Delete ${record.itemName}`}
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="text-4xl grayscale opacity-30">📂</div>
                      <p className="text-slate-500 text-sm font-medium">No results found for your query.</p>
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="text-blue-600 text-xs font-bold uppercase tracking-widest hover:underline"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
              <h3 id="modal-title" className="text-lg font-bold text-slate-800">New Inventory Entry</h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-slate-400 hover:text-slate-600 text-3xl focus:ring-2 focus:ring-slate-300 rounded-lg p-1 outline-none"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label htmlFor="item-name" className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Asset Identifier</label>
                  <input id="item-name" required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                         value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})}/>
                </div>
                <div>
                  <label htmlFor="category" className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Classification</label>
                  <input id="category" required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                         value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}/>
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Initial Volume</label>
                  <input id="quantity" required type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                         value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}/>
                </div>
                <div>
                  <label htmlFor="price" className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Unit Cost (₹)</label>
                  <input id="price" required type="number" step="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                         value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: parseFloat(e.target.value)})}/>
                </div>
                <div>
                  <label htmlFor="location" className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Storage Node</label>
                  <input id="location" required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                         value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}/>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all outline-none focus:ring-2 focus:ring-slate-300"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Authorize Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
