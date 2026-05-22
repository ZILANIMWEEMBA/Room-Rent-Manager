import React from 'react';
import { Building, Percent, DollarSign, AlertTriangle } from 'lucide-react';
import { Room, Booking } from '../types';
import { getDaysRemainingToFree, formatCurrency } from '../utils';

interface KPIStatsProps {
  rooms: Room[];
  bookings: Booking[];
  todayDate: string;
}

export const KPIStats: React.FC<KPIStatsProps> = ({ rooms, bookings, todayDate }) => {
  const totalRooms = rooms.length;
  const bookedRooms = rooms.filter(r => r.status === 'Booked').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;
  const availableRooms = rooms.filter(r => r.status === 'Available').length;
  
  // Occupancy percentage
  const occupancyRate = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0;
  
  // Total expected monthly rental income stream from active booked rooms
  const expectedRevenue = rooms
    .filter(r => r.status === 'Booked')
    .reduce((sum, r) => sum + r.rentAmount, 0);

  // Leases that are either expired/overdue or expiring in <= 7 days
  const urgentActionsCount = rooms.filter(r => {
    if (r.status !== 'Booked') return false;
    const activeBooking = bookings.find(b => b.roomId === r.id && b.status === 'Active');
    if (!activeBooking) return false;
    const { status } = getDaysRemainingToFree(activeBooking, todayDate);
    return status === 'expired' || status === 'due-today' || status === 'soon';
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Property Portfolio Card - No room counts shown here */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Property Portfolio</p>
            <h3 className="text-xl font-bold mt-1.5 text-slate-900 font-sans">
              Active Operations
            </h3>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-indigo-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-505 bg-indigo-600 animate-ping" />
              <span>Systems Online & Checked</span>
            </div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl text-slate-600">
            <Building className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Occupancy Rate Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupancy Index</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-900 font-mono">
              {occupancyRate}%
            </h3>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3.5 relative overflow-hidden">
              <div 
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${occupancyRate}%` }} 
              />
            </div>
          </div>
          <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Total Income stream Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Revenue Stream</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-600 font-mono">
              {formatCurrency(expectedRevenue)}<span className="text-xs font-normal text-slate-400">/mo</span>
            </h3>
            <p className="text-xs text-slate-400 mt-2.5">
              Across active rented occupancies
            </p>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action Alerts Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lease Alerts</p>
            <h3 className={`text-2xl font-bold mt-1 font-mono ${urgentActionsCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {urgentActionsCount} <span className="text-xs font-normal text-slate-400">Pending Actions</span>
            </h3>
            <p className="text-xs text-slate-400 mt-2.5">
              {urgentActionsCount > 0 ? 'Expiring/Expired contracts' : 'All contracts are stable'}
            </p>
          </div>
          <div className={`p-2.5 rounded-xl ${urgentActionsCount > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
