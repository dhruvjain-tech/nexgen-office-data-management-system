
import { InventoryRecord, DashboardStats, User, UserRole, UserStatus } from "../types";

const STORAGE_KEY = 'nexgen_inventory_data';
const USER_STORAGE_KEY = 'nexgen_system_users';

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

  saveRecord: (record: Omit<InventoryRecord, 'id' | 'lastUpdated' | 'status'>): InventoryRecord => {
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

  updateRecord: (id: string, updates: Partial<InventoryRecord>): void => {
    const records = DataService.getRecords();
    const updated = records.map(r => r.id === id ? { ...r, ...updates, lastUpdated: new Date().toISOString() } : r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  deleteRecord: (id: string): void => {
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

  // --- USER MANAGEMENT METHODS ---
  getUsers: (): User[] => {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    const users = data ? JSON.parse(data) : [
      { 
        id: 'admin-1', 
        username: 'Dhruv Jain', 
        email: 'dhruv.jain@nexgen.com', 
        role: UserRole.ADMIN, 
        status: UserStatus.ACTIVE, 
        createdAt: '2023-01-01T00:00:00Z',
        lastLogin: new Date().toISOString()
      },
      { 
        id: 'user-1', 
        username: 'John Staff', 
        email: 'john.staff@nexgen.com', 
        role: UserRole.USER, 
        status: UserStatus.ACTIVE, 
        createdAt: '2023-05-15T00:00:00Z',
        lastLogin: new Date().toISOString()
      }
    ];
    return users;
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
