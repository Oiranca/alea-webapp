export type Role = 'member' | 'admin';

export interface User {
  id: string;
  memberNumber: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  name: string;
  tableCount: number;
  description?: string;
}

export type TableType = 'small' | 'large' | 'removable_top';
export type TableSurface = 'top' | 'bottom';

export interface GameTable {
  id: string;
  roomId: string;
  name: string;
  type: TableType;
  qrCode: string;
}

export interface Reservation {
  id: string;
  tableId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'cancelled' | 'completed';
  surface?: TableSurface | null;
  createdAt: string;
}
