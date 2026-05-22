import { Room, Booking } from './types';

export const AMENITIES_LIST = [
  'High-Speed Wi-Fi',
  'Air Conditioning',
  'Attached Bathroom',
  'Kitchenette',
  'Balcony View',
  'Smart TV',
  'Workspace Desk',
  'Washing Machine',
  'Refrigerater',
  'Daily Housekeeping'
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-101',
    roomNumber: '101',
    type: 'Single',
    rentAmount: 350,
    status: 'Booked',
    description: 'A cozy single room with an elegant private workspace, large window, and ambient mood lighting.',
    floor: 1,
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Attached Bathroom', 'Workspace Desk'],
    maxOccupants: 1
  },
  {
    id: 'room-102',
    roomNumber: '102',
    type: 'Double',
    rentAmount: 500,
    status: 'Booked',
    description: 'Spacious double room designed for roommates or couples. Fully furnished with two twin beds.',
    floor: 1,
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Attached Bathroom', 'Smart TV', 'Refrigerater'],
    maxOccupants: 2
  },
  {
    id: 'room-201',
    roomNumber: '201',
    type: 'Suite',
    rentAmount: 850,
    status: 'Available',
    description: 'Premium master suite with private kitchen, luxury bathtub, private balcony, and king-size bed.',
    floor: 2,
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Attached Bathroom', 'Kitchenette', 'Balcony View', 'Smart TV', 'Washing Machine', 'Daily Housekeeping'],
    maxOccupants: 3
  },
  {
    id: 'room-202',
    roomNumber: '202',
    type: 'Studio',
    rentAmount: 600,
    status: 'Booked',
    description: 'Modern minimalist studio apartment. Extremely popular among executives and remote workers.',
    floor: 2,
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Attached Bathroom', 'Kitchenette', 'Workspace Desk', 'Washing Machine'],
    maxOccupants: 1
  },
  {
    id: 'room-301',
    roomNumber: '301',
    type: 'Deluxe',
    rentAmount: 700,
    status: 'Maintenance',
    description: 'Beautiful top-floor deluxe room with sweeping city views. Currently undergoing periodic painting.',
    floor: 3,
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Attached Bathroom', 'Balcony View', 'Smart TV'],
    maxOccupants: 2
  },
  {
    id: 'room-302',
    roomNumber: '302',
    type: 'Single',
    rentAmount: 380,
    status: 'Available',
    description: 'Compact single bedroom with excellent ventilation, personal study unit, and modern accents.',
    floor: 3,
    amenities: ['High-Speed Wi-Fi', 'Attached Bathroom', 'Workspace Desk'],
    maxOccupants: 1
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    roomId: 'room-101',
    tenantName: 'Sarah Jenkins',
    tenantPhone: '+1 (555) 234-5678',
    tenantEmail: 'sarah.j@example.com',
    startDate: '2026-02-15',
    endDate: '2026-05-25', // Ends soon (3 days left considering today is May 22, 2026)
    rentAmount: 350,
    depositAmount: 350,
    status: 'Active',
    paymentStatus: 'Paid',
    notes: 'Sarah is an excellent tenant. Pays on time via transfer.',
    createdAt: '2026-02-14T10:00:00Z'
  },
  {
    id: 'booking-2',
    roomId: 'room-102',
    tenantName: 'Alex & Marcus Rivera',
    tenantPhone: '+1 (555) 876-5432',
    tenantEmail: 'alex.rivera@example.com',
    startDate: '2025-11-10',
    endDate: '2026-05-20', // Overdue/Expired rental contract (Needs action - renew or checkout)
    rentAmount: 500,
    depositAmount: 500,
    status: 'Active',
    paymentStatus: 'Pending',
    notes: 'Requested contract extension, waiting for response.',
    createdAt: '2025-11-09T14:30:00Z'
  },
  {
    id: 'booking-3',
    roomId: 'room-202',
    tenantName: 'Dr. Gregory House',
    tenantPhone: '+1 (555) 432-1098',
    tenantEmail: 'ghouse@ppth.org',
    startDate: '2026-05-01',
    endDate: '2026-11-01', // Active, well down the road (163 days left)
    rentAmount: 600,
    depositAmount: 650,
    status: 'Active',
    paymentStatus: 'Paid',
    notes: 'Requested complete privacy, paid 2 months rent upfront.',
    createdAt: '2026-04-30T09:12:00Z'
  }
];
