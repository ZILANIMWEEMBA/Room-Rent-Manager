export type RoomType = 'Single' | 'Double' | 'Suite' | 'Studio' | 'Deluxe';

export type RoomStatus = 'Available' | 'Booked' | 'Maintenance';

export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue';

export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  rentAmount: number; // Monthly rent rate
  status: RoomStatus;
  description: string;
  floor: number;
  amenities: string[];
  maxOccupants: number;
}

export interface Booking {
  id: string;
  roomId: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  rentAmount: number; // Final agreed monthly rate
  depositAmount: number; // Security deposit collected
  status: 'Active' | 'Completed' | 'Cancelled';
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
}

export interface RentPayment {
  id: string;
  bookingId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Card' | 'Mobile Work';
  status: 'Paid' | 'Pending';
}
