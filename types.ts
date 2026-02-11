
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
  password?: string;
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

export enum SalesOrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface SalesOrderItem {
  inventoryId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

export interface SalesOrder {
  id: string;
  userId: string;
  username: string;
  items: SalesOrderItem[];
  totalAmount: number;
  status: SalesOrderStatus;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  documentName?: string;
  documentType?: string;
}

export interface DashboardStats {
  totalRecords: number;
  todayEntries: number;
  totalValue: number;
  lowStockItems: number;
}

export interface PerformanceStats {
  totalSales: number;
  orderCount: number;
  avgOrderValue: number;
  totalQuantity: number;
  topPerformer?: { name: string; amount: number };
  lowPerformer?: { name: string; amount: number };
}

export type Timeframe = 'daily' | 'weekly' | 'monthly' | 'yearly';
