
import React, { useState, useEffect, useMemo } from 'react';
import { DataService } from '../services/dataService';
import { InventoryRecord, SalesOrder, SalesOrderStatus, User, UserRole, SalesOrderItem } from '../types';

interface SalesOrdersProps {
  user: User;
}

const SalesOrders: React.FC<SalesOrdersProps> = ({ user }) => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Create Order State
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [currentOrderItems, setCurrentOrderItems] = useState<SalesOrderItem[]>([]);
  const [uploadedFile, setUploadedFile] = useState<{name: string, size: number} | null>(null);

  useEffect(() => {
    fetchData(true);
  }, []);

  const fetchData = async (fullLoad: boolean = false) => {
    if (fullLoad) setLoading(true);
    const orderData = DataService.getSalesOrders();
    const invData = DataService.getRecords();
    setOrders([...orderData]);
    setInventory([...invData]);
    if (fullLoad) setLoading(false);
  };

  const filteredOrders = useMemo(() => {
    if (user.role === UserRole.ADMIN) return orders;
    return orders.filter(o => o.userId === user.id);
  }, [orders, user]);

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Permanently delete this order record? This action cannot be undone.")) return;
    
    setIsSyncing(true);
    try {
      await DataService.deleteSalesOrder(id);
      await fetchData(false);
    } catch (err: any) {
      alert("Error deleting order: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const addItemToOrder = () => {
    const item = inventory.find(i => i.id === selectedItem);
    if (!item) return;
    
    if (quantity > item.quantity) {
      alert(`Insufficient stock! Only ${item.quantity} units available.`);
      return;
    }

    const newItem: SalesOrderItem = {
      inventoryId: item.id,
      itemName: item.itemName,
      quantity,
      unitPrice: item.unitPrice
    };

    setCurrentOrderItems([...currentOrderItems, newItem]);
    setSelectedItem('');
    setQuantity(1);
  };

  const removeItem = (index: number) => {
    setCurrentOrderItems(currentOrderItems.filter((_, i) => i !== index));
  };

  const totalAmount = useMemo(() => {
    return currentOrderItems.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
  }, [currentOrderItems]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile({ name: file.name, size: file.size });
    }
  };

  const handleSubmitOrder = async () => {
    if (currentOrderItems.length === 0) return;
    setIsSyncing(true);
    try {
        await DataService.createSalesOrder({
          userId: user.id,
          username: user.username,
          items: currentOrderItems,
          totalAmount,
          documentName: uploadedFile?.name,
          documentType: 'PDF/Excel'
        });
        await fetchData(false);
        setShowModal(false);
        resetForm();
    } catch (err: any) {
        alert("Submission Error: " + err.message);
    } finally {
        setIsSyncing(false);
    }
  };

  const resetForm = () => {
    setCurrentOrderItems([]);
    setSelectedItem('');
    setQuantity(1);
    setUploadedFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sales Hub</h1>
          <p className="text-sm text-slate-500">Order processing and transaction registry</p>
        </div>
        {user.role === UserRole.USER && (
          <button 
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <span>✨</span> Create New Order
          </button>
        )}
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Sales Volume</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">
            {filteredOrders.length} Transactions
          </h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Valuation</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">
            ₹{filteredOrders.reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString('en-IN')}
          </h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Stock Items</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">
            {inventory.filter(i => i.quantity > 0).length} Assets
          </h3>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative">
        {isSyncing && (
          <div className="absolute inset-x-0 top-0 h-1 bg-blue-100 overflow-hidden">
            <div className="h-full bg-blue-600 animate-[loading_1.5s_infinite_linear] w-1/3 origin-left"></div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Timeline</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Loading Sales Registry...</td></tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-blue-600 font-mono">{order.id}</div>
                      <div className="text-[9px] text-slate-400 uppercase font-black">{order.items.length} Items</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800">{order.username}</div>
                      <div className="text-[9px] text-slate-400">{order.documentName || 'No Doc Attached'}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-900">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border bg-emerald-50 text-emerald-600 border-emerald-100">
                        Processed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[10px] text-slate-500">
                      <div className="font-bold">{new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                      <div className="text-[9px] opacity-60">{new Date(order.createdAt).toLocaleTimeString('en-IN')}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={isSyncing}
                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Record"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="p-20 text-center text-slate-400">No sales orders found in the registry.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 border-b border-slate-200 p-8 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Generate Sales Order</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Automated Stock Commitment</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Assignment</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <select 
                    className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                  >
                    <option value="">Choose Asset...</option>
                    {inventory.filter(i => i.quantity > 0).map(i => (
                      <option key={i.id} value={i.id}>{i.itemName} (₹{i.unitPrice.toLocaleString()} • Avail: {i.quantity})</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    min="1" 
                    placeholder="Qty"
                    className="w-full sm:w-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                  />
                  <button 
                    onClick={addItemToOrder}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95"
                  >
                    Add
                  </button>
                </div>

                {currentOrderItems.length > 0 && (
                  <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/50">
                        <tr>
                          <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-tighter">Line Asset</th>
                          <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-tighter text-center">Qty</th>
                          <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-tighter">Subtotal</th>
                          <th className="px-4 py-3 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentOrderItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-white transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-700">{item.itemName}</td>
                            <td className="px-4 py-3 font-bold text-slate-600 text-center">{item.quantity}</td>
                            <td className="px-4 py-3 font-bold text-slate-900 font-mono">₹{(item.quantity * item.unitPrice).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => removeItem(idx)} className="text-rose-500 hover:text-rose-700 font-black text-[10px] uppercase tracking-widest px-2 py-1 rounded hover:bg-rose-50">Discard</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supporting Evidence</h4>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-3xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📎</span>
                      <p className="text-xs font-bold text-slate-600">
                        {uploadedFile ? <span className="text-blue-600">{uploadedFile.name}</span> : 'Attach PO / Invoice Authorization'}
                      </p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.xlsx,.xls" />
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between p-8 bg-slate-900 rounded-[2rem] text-white shadow-xl gap-6">
                <div>
                  <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-1">Cumulative Total</p>
                  <p className="text-3xl font-black font-mono">₹{totalAmount.toLocaleString('en-IN')}</p>
                </div>
                <button 
                  onClick={handleSubmitOrder}
                  disabled={currentOrderItems.length === 0 || isSyncing}
                  className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                >
                  {isSyncing ? (
                    <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : 'FINALIZE TRANSACTION'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default SalesOrders;
