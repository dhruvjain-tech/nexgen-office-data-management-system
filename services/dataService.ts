
import { 
  InventoryRecord, 
  DashboardStats, 
  User, 
  UserRole, 
  UserStatus, 
  SalesOrder, 
  SalesOrderStatus,
  PerformanceStats,
  Timeframe
} from "../types";

const STORAGE_KEY = 'nexgen_inventory_data';
const USER_STORAGE_KEY = 'nexgen_system_users';
const ORDER_STORAGE_KEY = 'nexgen_sales_orders';

export const DataService = {
  // --- INVENTORY METHODS ---
  getRecords: (): InventoryRecord[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [
      { id: '1', itemName: 'Ergonomic Desk Chair', category: 'Furniture', quantity: 25, unitPrice: 199.99, lastUpdated: new Date().toISOString(), status: 'In Stock', location: 'Floor 1 - Section A' },
      { id: '2', itemName: 'MacBook Pro 14"', category: 'Electronics', quantity: 3, unitPrice: 2499.00, lastUpdated: new Date().toISOString(), status: 'Low Stock', location: 'Storage C' },
      { id: '3', itemName: 'Wireless Mouse', category: 'Accessories', quantity: 50, unitPrice: 29.99, lastUpdated: new Date().toISOString(), status: 'In Stock', location: 'Floor 1 - Supply Room' }
    ];
  },

  saveRecord: async (record: Omit<InventoryRecord, 'id' | 'lastUpdated' | 'status'>): Promise<InventoryRecord> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const records = DataService.getRecords();
    const newRecord: InventoryRecord = {
      ...record,
      id: Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date().toISOString(),
      status: record.quantity > 10 ? 'In Stock' : (record.quantity > 0 ? 'Low Stock' : 'Out of Stock')
    };
    const updated = [...records, newRecord];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newRecord;
  },

  updateRecord: async (id: string, updates: Partial<InventoryRecord>): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const records = DataService.getRecords();
    const updated = records.map(r => {
      if (r.id === id) {
        const merged = { ...r, ...updates, lastUpdated: new Date().toISOString() };
        if (merged.quantity > 10) merged.status = 'In Stock';
        else if (merged.quantity > 0) merged.status = 'Low Stock';
        else merged.status = 'Out of Stock';
        return merged;
      }
      return r;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  deleteRecord: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const records = DataService.getRecords();
    const updated = records.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  getStats: (): DashboardStats => {
    const records = DataService.getRecords();
    const today = new Date().toISOString().split('T')[0];
    return {
      totalRecords: records.length,
      todayEntries: records.filter(r => r.lastUpdated.startsWith(today)).length,
      totalValue: records.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0),
      lowStockItems: records.filter(r => r.status === 'Low Stock' || r.status === 'Out of Stock').length
    };
  },

  // --- SALES ORDER METHODS ---
  getSalesOrders: (): SalesOrder[] => {
    const data = localStorage.getItem(ORDER_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  deleteSalesOrder: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const orders = DataService.getSalesOrders();
    const updated = orders.filter(o => o.id !== id);
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(updated));
  },

  createSalesOrder: async (order: Omit<SalesOrder, 'id' | 'createdAt' | 'status'>): Promise<SalesOrder> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const records = DataService.getRecords();
    const orders = DataService.getSalesOrders();

    // 1. Validation Phase (Ensure stock is available before committing order)
    for (const item of order.items) {
      const stockItem = records.find(r => r.id === item.inventoryId);
      if (!stockItem || stockItem.quantity < item.quantity) {
        throw new Error(`Stock Depletion: ${item.itemName} has insufficient balance.`);
      }
    }

    // 2. Execution Phase (Deduct stock immediately upon creation)
    for (const item of order.items) {
      const stockItem = records.find(r => r.id === item.inventoryId);
      if (stockItem) {
        stockItem.quantity -= item.quantity;
        stockItem.lastUpdated = new Date().toISOString();
        if (stockItem.quantity > 10) stockItem.status = 'In Stock';
        else if (stockItem.quantity > 0) stockItem.status = 'Low Stock';
        else stockItem.status = 'Out of Stock';
      }
    }
    
    // 3. Persist Inventory Changes
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

    // 4. Create and Persist Order record as APPROVED (Processed)
    const newOrder: SalesOrder = {
      ...order,
      id: `SO-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      status: SalesOrderStatus.APPROVED // Orders are automatically approved on successful stock check
    };
    
    const updatedOrders = [newOrder, ...orders];
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(updatedOrders));
    return newOrder;
  },

  // This method is now effectively deprecated as approval/disapproval is removed from UI
  processSalesOrder: async (orderId: string, status: SalesOrderStatus, processedBy: string): Promise<void> => {
    console.warn("processSalesOrder called, but approval feature is removed.");
  },

  // --- PERFORMANCE REPORTING METHODS ---
  getPerformanceStats: (userId?: string, dateRange?: { start: Date; end: Date }): PerformanceStats => {
    const orders = DataService.getSalesOrders().filter(o => o.status === SalesOrderStatus.APPROVED);
    let filtered = orders;

    if (userId) {
      filtered = filtered.filter(o => o.userId === userId);
    }

    if (dateRange) {
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= dateRange.start && orderDate <= dateRange.end;
      });
    }

    const totalSales = filtered.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalQuantity = filtered.reduce((acc, curr) => 
      acc + curr.items.reduce((sum, item) => sum + item.quantity, 0), 0
    );

    const employeeBuckets: Record<string, number> = {};
    filtered.forEach(o => {
      employeeBuckets[o.username] = (employeeBuckets[o.username] || 0) + o.totalAmount;
    });

    const entries = Object.entries(employeeBuckets).sort((a, b) => b[1] - a[1]);

    return {
      totalSales,
      orderCount: filtered.length,
      avgOrderValue: filtered.length > 0 ? totalSales / filtered.length : 0,
      totalQuantity,
      topPerformer: entries.length > 0 ? { name: entries[0][0], amount: entries[0][1] } : undefined,
      lowPerformer: entries.length > 0 ? { name: entries[entries.length - 1][0], amount: entries[entries.length - 1][1] } : undefined
    };
  },

  getSalesTrendData: (timeframe: Timeframe, userId?: string) => {
    const orders = DataService.getSalesOrders().filter(o => o.status === SalesOrderStatus.APPROVED);
    const filtered = userId ? orders.filter(o => o.userId === userId) : orders;
    
    const buckets: Record<string, { amount: number, count: number }> = {};

    filtered.forEach(o => {
      const date = new Date(o.createdAt);
      let key = '';

      if (timeframe === 'daily') {
        key = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      } else if (timeframe === 'weekly') {
        const oneJan = new Date(date.getFullYear(), 0, 1);
        const numberOfDays = Math.floor((date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
        key = `Week ${week}`;
      } else if (timeframe === 'monthly') {
        key = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      } else if (timeframe === 'yearly') {
        key = date.getFullYear().toString();
      }

      if (!buckets[key]) buckets[key] = { amount: 0, count: 0 };
      buckets[key].amount += o.totalAmount;
      buckets[key].count += 1;
    });

    return Object.entries(buckets).map(([name, data]) => ({
      name,
      amount: data.amount,
      count: data.count
    }));
  },

  // --- USER MANAGEMENT METHODS ---
  getUsers: (): User[] => {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    const users = data ? JSON.parse(data) : [
      { 
        id: 'admin-1', 
        username: 'Dhruv Jain', 
        email: 'dhruv.jain@nexgen.com', 
        password: 'admindhruv1234',
        role: UserRole.ADMIN, 
        status: UserStatus.ACTIVE, 
        createdAt: '2023-01-01T00:00:00Z',
        lastLogin: new Date().toISOString()
      },
      { 
        id: 'user-1', 
        username: 'John Staff', 
        email: 'john.staff@nexgen.com', 
        password: 'password123',
        role: UserRole.USER, 
        status: UserStatus.ACTIVE, 
        createdAt: '2023-05-15T00:00:00Z',
        lastLogin: new Date().toISOString()
      }
    ];
    return users;
  },

  authenticate: async (username: string, password: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const users = DataService.getUsers();
    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === password
    );

    if (user && user.status === UserStatus.ACTIVE) {
      const updatedUser = { ...user, lastLogin: new Date().toLocaleString('en-IN') };
      DataService.updateUser(user.id, { lastLogin: updatedUser.lastLogin });
      return updatedUser;
    }
    return null;
  },

  saveUser: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): User => {
    const users = DataService.getUsers();
    const newUser: User = {
      ...user,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      lastLogin: '-',
      status: user.status || UserStatus.ACTIVE
    };
    const updated = [...users, newUser];
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    return newUser;
  },

  updateUser: (id: string, updates: Partial<User>): void => {
    const users = DataService.getUsers();
    const updated = users.map(u => u.id === id ? { ...u, ...updates } : u);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
  },

  deleteUser: (id: string): void => {
    const users = DataService.getUsers();
    const updated = users.filter(u => u.id !== id);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
  }
};
