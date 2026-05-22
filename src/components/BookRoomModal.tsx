import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Phone, Mail, DollarSign } from 'lucide-react';
import { Room, Booking, PaymentStatus } from '../types';

interface BookRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onSave: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  todayDate: string;
}

export const BookRoomModal: React.FC<BookRoomModalProps> = ({
  isOpen,
  onClose,
  room,
  onSave,
  todayDate
}) => {
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [startDate, setStartDate] = useState(todayDate);
  
  // Default end date is 6 months from today
  const getDefaultEndDate = () => {
    try {
      const d = new Date(todayDate + 'T00:00:00');
      d.setMonth(d.getMonth() + 6);
      return d.toISOString().split('T')[0];
    } catch {
      return todayDate;
    }
  };
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  
  const [rentAmount, setRentAmount] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Auto-populate when room loads
  useEffect(() => {
    if (room) {
      setRentAmount(room.rentAmount);
      setDepositAmount(room.rentAmount); // deposit defaults to 1 month rent
      setTenantName('');
      setTenantPhone('');
      setTenantEmail('');
      setStartDate(todayDate);
      
      const futureDate = new Date(todayDate + 'T00:00:00');
      futureDate.setMonth(futureDate.getMonth() + 6);
      setEndDate(futureDate.toISOString().split('T')[0]);
      
      setNotes('');
      setPaymentStatus('Paid');
      setError('');
    }
  }, [room, todayDate]);

  if (!isOpen || !room) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Pre-validations
    if (!tenantName.trim()) {
      setError('Tenant name is required.');
      return;
    }
    if (!tenantPhone.trim()) {
      setError('Tenant phone number is required.');
      return;
    }

    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    if (end <= start) {
      setError('Release Date must be strictly after lease Start Date.');
      return;
    }

    if (rentAmount <= 0) {
      setError('Agreed rent amount must be greater than $0.');
      return;
    }

    onSave({
      roomId: room.id,
      tenantName: tenantName.trim(),
      tenantPhone: tenantPhone.trim(),
      tenantEmail: tenantEmail.trim() || 'no-email@example.com',
      startDate,
      endDate,
      rentAmount,
      depositAmount,
      status: 'Active',
      paymentStatus,
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="book-room-modal-overlay">
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-100 overflow-hidden scale-in"
        id="book-room-modal-container"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Book Room {room.roomNumber}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Initialize a binding tenancy contract for Room {room.roomNumber} ({room.type}).</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            id="close-book-room-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[75vh]" id="book-room-form">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-lg flex items-center gap-2">
              <span className="font-semibold">Input Error:</span> {error}
            </div>
          )}

          {/* Quick Info Box */}
          <div className="mb-5 bg-indigo-50/55 rounded-xl p-4 border border-indigo-100/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest px-1.5 py-0.5 bg-indigo-100/80 rounded">Target Asset</span>
              <p className="text-sm font-semibold text-slate-900 mt-1">Room {room.roomNumber} &bull; {room.type} category</p>
              <p className="text-xs text-slate-500">Base Rate: ${room.rentAmount}/month &bull; Max capacity: {room.maxOccupants} guest{room.maxOccupants > 1 ? 's' : ''}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Target Floor</span>
              <p className="text-lg font-mono font-bold text-indigo-950">F-{room.floor}</p>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tenant Personal Details</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {/* Tenant Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input 
                  type="text"
                  required
                  placeholder="John Doe"
                  value={tenantName}
                  onChange={e => setTenantName(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-medium"
                  id="book-tenant-name-input"
                />
              </div>
            </div>

            {/* Tenant Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input 
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={tenantPhone}
                  onChange={e => setTenantPhone(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-all"
                  id="book-tenant-phone-input"
                />
              </div>
            </div>

            {/* Tenant Email */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email"
                  placeholder="johndoe@example.com"
                  value={tenantEmail}
                  onChange={e => setTenantEmail(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-all"
                  id="book-tenant-email-input"
                />
              </div>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Lease Terms & Booking Parameters</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Lease Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Lease Start Date
              </label>
              <input 
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-all"
                id="book-start-date-input"
              />
            </div>

            {/* Lease End Date / Free Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Release Date (Ends) <span className="text-rose-500">*</span>
              </label>
              <input 
                type="date"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-amber-50/20 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-all"
                id="book-end-date-input"
              />
            </div>

            {/* Agreed Monthly Rent */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Negotiated Monthly Rent (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-sm font-mono">$</span>
                <input 
                  type="number"
                  required
                  min="1"
                  value={rentAmount || ''}
                  onChange={e => setRentAmount(Number(e.target.value))}
                  className="w-full text-sm border border-slate-200 rounded-lg pl-7 pr-3 py-2 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-all"
                  id="book-rent-input"
                />
              </div>
            </div>

            {/* Security Deposit */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Security Deposit Collected (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-sm font-mono">$</span>
                <input 
                  type="number"
                  required
                  min="0"
                  value={depositAmount || 0}
                  onChange={e => setDepositAmount(Number(e.target.value))}
                  className="w-full text-sm border border-slate-200 rounded-lg pl-7 pr-3 py-2 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-all"
                  id="book-deposit-input"
                />
              </div>
            </div>

            {/* Rent Payment Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                First Month Payment Status
              </label>
              <select 
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium transition-all"
                id="book-payment-status-select"
              >
                <option value="Paid">Paid (Confirmed)</option>
                <option value="Pending">Pending / Unpaid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Additional Lease Terms / Notes
            </label>
            <textarea 
              rows={2}
              placeholder="e.g., Tenant requested desk rearrangement, or keys handed over."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
              id="book-notes-input"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
              id="cancel-book-btn"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1"
              id="submit-book-btn"
            >
              Confirm Tenancy booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
