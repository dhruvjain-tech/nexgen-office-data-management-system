
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  email: string;
  status?: UserStatus;
  createdAt?: string;
  lastLogin?: string;
  password?: string; // Included for simulation purposes
}

export interface InventoryRecord {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  lastUpdated: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  location: string;
}

export interface DashboardStats {
  totalRecords: number;
  todayEntries: number;
  totalValue: number;
  lowStockItems: number;
}
