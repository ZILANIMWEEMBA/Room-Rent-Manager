import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Bed, 
  Users, 
  Compass, 
  Calendar, 
  Phone, 
  Mail, 
  FileText, 
  Clock, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Wrench, 
  ExternalLink, 
  ChevronRight,
  AlertTriangle,
  FlameKindling,
  Sparkles,
  RefreshCw,
  Clock3
} from 'lucide-react';

import { Room, Booking, RoomType, RoomStatus } from './types';
import { INITIAL_ROOMS, INITIAL_BOOKINGS } from './data';
import { getDaysRemainingToFree, formatCurrency, formatDate, storage } from './utils';
import { KPIStats } from './components/KPIStats';
import { AddRoomModal } from './components/AddRoomModal';
import { BookRoomModal } from './components/BookRoomModal';
import { EditRoomModal } from './components/EditRoomModal';
import { DateConfigBanner } from './components/DateConfigBanner';

export default function App() {
  // --- Persistent States ---
  const [rooms, setRooms] = useState<Room[]>(() => 
    storage.get<Room[]>('rrr_rooms_data', INITIAL_ROOMS)
  );
  const [bookings, setBookings] = useState<Booking[]>(() => 
    storage.get<Booking[]>('rrr_bookings_data', INITIAL_BOOKINGS)
  );
  // Default simulated "Today" is set to May 22, 2026 as per workspace guidelines
  const [todayDate, setTodayDate] = useState<string>(() => 
    storage.get<string>('rrr_today_date_str', '2026-05-22')
  );

  // --- UI Filter States ---
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | RoomStatus>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | RoomType>('All');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // --- Modal Toggle States ---
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isBookRoomOpen, setIsBookRoomOpen] = useState(false);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
  const [roomToBook, setRoomToBook] = useState<Room | null>(null);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);

  // --- Lease Extension State ---
  const [isExtending, setIsExtending] = useState(false);
  const [newEndDate, setNewEndDate] = useState('');
  const [extensionError, setExtensionError] = useState('');

  // Save states to local storage on changes
  useEffect(() => {
    storage.set('rrr_rooms_data', rooms);
  }, [rooms]);

  useEffect(() => {
    storage.set('rrr_bookings_data', bookings);
  }, [bookings]);

  useEffect(() => {
    storage.set('rrr_today_date_str', todayDate);
  }, [todayDate]);

  // Default select first room if none is selected
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  // --- Derived Values & Calculations ---
  // Match bookings to specific room index
  const getActiveBookingForRoom = (roomId: string) => {
    return bookings.find(b => b.roomId === roomId && b.status === 'Active');
  };

  const getHistoricalBookingsForRoom = (roomId: string) => {
    return bookings.filter(b => b.roomId === roomId && b.status !== 'Active');
  };

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || null;
  const activeBooking = selectedRoom ? getActiveBookingForRoom(selectedRoom.id) : null;
  const historicBookings = selectedRoom ? getHistoricalBookingsForRoom(selectedRoom.id) : [];

  // --- Filter Logic ---
  const filteredRooms = rooms.filter(room => {
    const activeBooking = getActiveBookingForRoom(room.id);
    const tenantNameStr = activeBooking ? activeBooking.tenantName.toLowerCase() : '';
    const searchMatch = 
      room.roomNumber.toLowerCase().includes(searchText.toLowerCase()) || 
      room.type.toLowerCase().includes(searchText.toLowerCase()) ||
      tenantNameStr.includes(searchText.toLowerCase());

    const statusMatch = statusFilter === 'All' || room.status === statusFilter;
    const typeMatch = typeFilter === 'All' || room.type === typeFilter;

    return searchMatch && statusMatch && typeMatch;
  });

  // --- Operations Actions ---
  
  // 1. ADD ROOM
  const handleAddRoom = (newRoomData: Omit<Room, 'id'>) => {
    const newRoom: Room = {
      ...newRoomData,
      id: `room-${Date.now()}`
    };
    setRooms(prev => [...prev, newRoom]);
    setSelectedRoomId(newRoom.id); // set focus to newly added room
  };

  // 2. EDIT ROOM DETAILS
  const handleEditRoom = (updatedRoom: Room) => {
    setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
  };

  // 3. BOOK ROOM (Initiate Tenancy)
  const handleBookRoom = (newBookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    if (!roomToBook) return;

    const newBooking: Booking = {
      ...newBookingData,
      id: `booking-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [...prev, newBooking]);
    setRooms(prev => prev.map(r => r.id === roomToBook.id ? { ...r, status: 'Booked' } : r));
    setSelectedRoomId(roomToBook.id);
    setRoomToBook(null);
  };

  // 4. CHECK-OUT TENANT (Release Room Booking)
  const handleCheckoutTenant = (roomId: string) => {
    const activeUnitBooking = bookings.find(b => b.roomId === roomId && b.status === 'Active');
    if (!activeUnitBooking) return;

    if (window.confirm(`Are you sure you want to check out current leaseholder and release Room ${rooms.find(r => r.id === roomId)?.roomNumber}?`)) {
      // Mark booking as completed
      setBookings(prev => prev.map(b => b.id === activeUnitBooking.id ? { ...b, status: 'Completed' } : b));
      // Reset Room to 'Available' 
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: 'Available' } : r));
      // Reset extension states
      setIsExtending(false);
      setNewEndDate('');
    }
  };

  // 5. EXTEND LEASE / DATE COUNTDOWN
  const handleExtendLease = (e: React.FormEvent) => {
    e.preventDefault();
    setExtensionError('');

    if (!activeBooking) return;

    const originalEnd = new Date(activeBooking.endDate + 'T00:00:00');
    const proposedEnd = new Date(newEndDate + 'T00:00:00');

    if (proposedEnd <= originalEnd) {
      setExtensionError('New date must be later than the current set release date.');
      return;
    }

    setBookings(prev => prev.map(b => 
      b.id === activeBooking.id 
        ? { ...b, endDate: newEndDate } 
        : b
    ));

    setIsExtending(false);
    setNewEndDate('');
  };

  // 6. TOGGLE MAINTENANCE STATE MANUALLY
  const toggleMaintenance = (roomId: string) => {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r;
      const targetStatus: RoomStatus = r.status === 'Maintenance' ? 'Available' : 'Maintenance';
      return { ...r, status: targetStatus };
    }));
  };

  // 7. DELETE ROOM listings
  const handleDeleteRoom = (roomId: string, roomNum: string) => {
    const isOccupied = rooms.some(r => r.id === roomId && r.status === 'Booked');
    if (isOccupied) {
      alert(`Room ${roomNum} is currently booked. You must check out the tenant before deleting this room listing.`);
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete Room ${roomNum} listing? This action cannot be undone.`)) {
      setRooms(prev => prev.filter(r => r.id !== roomId));
      setBookings(prev => prev.filter(b => b.roomId !== roomId)); // Clean associated booking histories
      setSelectedRoomId(rooms.filter(r => r.id !== roomId)[0]?.id || null);
    }
  };

  // Reset entire dashboard state to default mock data (Great for Sandbox review)
  const handleResetData = () => {
    if (window.confirm('This will restore all default rentals, bookings, and dates. Are you sure?')) {
      localStorage.removeItem('rrr_rooms_data');
      localStorage.removeItem('rrr_bookings_data');
      localStorage.removeItem('rrr_today_date_str');
      setRooms(INITIAL_ROOMS);
      setBookings(INITIAL_BOOKINGS);
      setTodayDate('2026-05-22');
      setSelectedRoomId(INITIAL_ROOMS[0].id);
      setIsExtending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased" id="main-applet-root">
      
      {/* Decorative Brand Top Banner */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30" id="header-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Left Brand Badge */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xs hover:scale-105 transition-transform duration-300">
                <Compass className="w-5 h-5 animate-spin-slow text-indigo-50" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">HearthStone Rooms</h1>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-mono">Operations Command Desk</p>
              </div>
            </div>

            {/* Right Action buttons */}
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => setIsAddRoomOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all"
                id="header-add-room-btn"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Room</span>
              </button>

              <button 
                onClick={handleResetData}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:py-2 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-100 rounded-xl transition-all"
                title="Restore default database lists"
                id="header-restore-btn"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset Defaults</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Workspace Layout Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Simulation Date Controller & Instruction Ban */}
        <DateConfigBanner 
          todayDate={todayDate}
          onDateChange={setTodayDate}
          onResetDate={() => setTodayDate('2026-05-22')}
        />

        {/* Dashboard Operational KPI Board */}
        <KPIStats 
          rooms={rooms}
          bookings={bookings}
          todayDate={todayDate}
        />

        {/* Grid Separation: Left Column (Listing & Filters) | Right Column (Interactive Panel details) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="workspace-grid">
          
          {/* LEFT PANEL: Rooms Directory & Filter Bar (Takes 7 columns on large desktop) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-xs p-5 md:p-6" id="left-directory-panel">
            
            {/* Header section in listing */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Rental Directory</h3>
                <p className="text-xs text-slate-400 mt-0.5">Filter, search, and monitor physical vacancies.</p>
              </div>
              <span className="self-start sm:self-center px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                Active Listings
              </span>
            </div>

            {/* Live Search & Segment Filters */}
            <div className="space-y-4 mb-6">
              
              {/* Text Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by Room #, Tenant Name, or type (Single, Deluxe...)" 
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="w-full text-xs pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-medium"
                  id="directory-search-input"
                />
                {searchText && (
                  <button 
                    onClick={() => setSearchText('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                    id="clear-search-btn"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Status Segment Filters */}
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Filter by Status</p>
                <div className="flex flex-wrap gap-1.5" id="status-chips-filter">
                  {(['All', 'Available', 'Booked', 'Maintenance'] as const).map(status => {
                    const isActive = statusFilter === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isActive 
                            ? 'bg-slate-900 text-white shadow-xs' 
                            : 'bg-slate-100/70 hover:bg-slate-100 text-slate-600'
                        }`}
                        id={`filter-status-${status.toLowerCase()}`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category selector */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Class / Type</label>
                  <select 
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value as 'All' | RoomType)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:outline-hidden focus:border-indigo-600"
                    id="type-select-filter"
                  >
                    <option value="All">All Classifications</option>
                    <option value="Single">Single Room</option>
                    <option value="Double">Double Room</option>
                    <option value="Suite">Premium Suite</option>
                    <option value="Studio">Studio Apartment</option>
                    <option value="Deluxe">Deluxe Room</option>
                  </select>
                </div>
                {/* Visual Reset trigger */}
                <div className="flex items-end">
                  {(statusFilter !== 'All' || typeFilter !== 'All' || searchText !== '') && (
                    <button 
                      onClick={() => {
                        setStatusFilter('All');
                        setTypeFilter('All');
                        setSearchText('');
                      }}
                      className="w-full text-center py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-dashed border-rose-200 transition-all cursor-pointer"
                      id="reset-all-filters-btn"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* List Cards Group */}
            <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1" id="rooms-list-scroll-container">
              {filteredRooms.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                  <Bed className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-500">No rooms match your filter queries.</p>
                  <p className="text-xs text-slate-400 mt-1">Try expanding search strings or switching status segments.</p>
                </div>
              ) : (
                filteredRooms.map(room => {
                  const isSelected = selectedRoomId === room.id;
                  const roomBooking = getActiveBookingForRoom(room.id);
                  const countdown = getDaysRemainingToFree(roomBooking, todayDate);
                  
                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer relative ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/20 shadow-sm ring-1 ring-indigo-600' 
                          : 'border-slate-100 hover:border-slate-200 bg-white hover:shadow-xs'
                      }`}
                      id={`room-card-${room.roomNumber}`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        
                        {/* Left: Info details */}
                        <div className="space-y-1">
                          
                          {/* Room identifier block */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-slate-900 font-mono">Room {room.roomNumber}</span>
                            <span className="px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded">
                              {room.type}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">F-{room.floor}</span>
                          </div>

                          {/* Secondary status text */}
                          {room.status === 'Booked' && roomBooking ? (
                            <p className="text-xs text-indigo-700 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                              Active Booking Rented
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400 italic font-normal">
                              {room.description.length > 60 ? `${room.description.substring(0, 60)}...` : room.description}
                            </p>
                          )}

                          {/* Quick key icons or tag indicator */}
                          <div className="flex flex-wrap gap-1 pt-1.5">
                            {room.amenities.slice(0, 3).map(a => (
                              <span key={a} className="text-[9px] px-1.5 py-0.2 bg-slate-100/80 rounded-sm text-slate-500 font-medium">{a}</span>
                            ))}
                            {room.amenities.length > 3 && (
                              <span className="text-[9px] px-1 bg-slate-50 rounded-sm text-slate-400">+{room.amenities.length - 3}</span>
                            )}
                          </div>

                        </div>

                        {/* Right: Price & Days Status Indicators */}
                        <div className="text-right shrink-0 flex flex-col justify-between items-end h-full">
                          
                          {/* Core price identifier */}
                          <div>
                            <span className="text-sm font-bold text-slate-900 font-mono">{formatCurrency(room.rentAmount)}</span>
                            <span className="text-[10px] text-slate-400">/mo</span>
                          </div>

                          {/* Active Status Ribbon/Badges */}
                          <div className="mt-2.5">
                            {room.status === 'Available' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Available Vacancy
                              </span>
                            )}

                            {room.status === 'Maintenance' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg">
                                <Wrench className="w-3 h-3 text-amber-500 shrink-0" />
                                Maintenance Locked
                              </span>
                            )}

                            {room.status === 'Booked' && roomBooking && (
                              <div className="space-y-1 text-right">
                                {/* State of vacancy */}
                                <span className="inline-flex items-center gap-1 px-2.2 py-0.8 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg">
                                  Occupied Rent
                                </span>
                                
                                {/* Countdown highlights (DAYS LEFT TO FREE) */}
                                <div className="mt-1">
                                  {countdown.status === 'expired' && (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-100 rounded-md shrink-0 font-mono">
                                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
                                      {countdown.label}
                                    </span>
                                  )}
                                  {countdown.status === 'due-today' && (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 rounded-md shrink-0 font-mono">
                                      <Clock3 className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
                                      {countdown.label}
                                    </span>
                                  )}
                                  {countdown.status === 'soon' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-amber-600 bg-amber-50/50 border border-amber-100 rounded-md shrink-0 font-mono">
                                      <Clock className="w-3 h-3" />
                                      {countdown.label}
                                    </span>
                                  )}
                                  {countdown.status === 'distant' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 rounded-md shrink-0 font-mono">
                                      <Calendar className="w-3 h-3" />
                                      {countdown.label}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                          </div>

                        </div>

                      </div>

                      {/* Accent selected background sidebar notch */}
                      {isSelected && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-r" />
                      )}

                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* RIGHT PANEL: Interactive Selected Room Operations Hub (Takes 5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6" id="right-control-panel">
            
            {selectedRoom ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="room-operations-hub">
                
                {/* Card Title Banner */}
                <div className="bg-slate-900 text-white p-5 md:p-6 pb-8 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold bg-indigo-600/90 text-indigo-100 uppercase px-2 py-0.5 rounded tracking-widest font-mono">
                        Room {selectedRoom.roomNumber} Detail File
                      </span>
                      <h2 className="text-xl font-black mt-2 font-mono flex items-baseline gap-1.5 text-white">
                        Room {selectedRoom.roomNumber}
                        <span className="text-xs font-normal text-slate-300">({selectedRoom.type})</span>
                      </h2>
                      <p className="text-xs text-slate-300 mt-0.5">Floor Level F-{selectedRoom.floor} &bull; Comfort Portfolio</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">Monthly Rent</p>
                      <h3 className="text-xl font-black font-mono text-emerald-400 mt-1">{formatCurrency(selectedRoom.rentAmount)}</h3>
                    </div>
                  </div>

                  {/* Absolute visual room classification icon */}
                  <div className="absolute right-6 -bottom-5 bg-white text-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100">
                    <Bed className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>

                {/* Operations content scroll */}
                <div className="p-5 md:p-6 pt-8 space-y-6">
                  
                  {/* Status Block overview */}
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2.5">Current Occupancy State</h4>
                    {selectedRoom.status === 'Available' && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3.5" id="status-display-available">
                        <div className="bg-emerald-100 text-emerald-800 p-2.5 rounded-xl shrink-0 h-fit">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-900">Vacuum Availabilities</p>
                          <p className="text-xs text-emerald-600/90 mt-1 leading-snug">
                            This room has no active tenants, it is fully deep-cleaned, checked, and ready to list for immediate check-ins.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedRoom.status === 'Maintenance' && (
                      <div className="bg-amber-50 border border-amber-150 rounded-xl p-4 flex gap-3.5" id="status-display-maintenance">
                        <div className="bg-amber-100 text-amber-800 p-2.5 rounded-xl shrink-0 h-fit">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-amber-900">Undergoing Repair Work</p>
                          <p className="text-xs text-amber-600/90 mt-1 leading-snug">
                            Room is locked from public lists due to maintenance. Change back to &ldquo;Available&rdquo; below once work completes.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedRoom.status === 'Booked' && activeBooking && (
                      <div className="space-y-4" id="status-display-booked">
                        
                        {/* Days left indicator Callout Box */}
                        {(() => {
                          const countdown = getDaysRemainingToFree(activeBooking, todayDate);
                          let boxColor = 'bg-slate-50 border-slate-150 text-slate-800';
                          let iconColor = 'text-slate-500';
                          let title = 'Active Tenancy in Progress';

                          if (countdown.status === 'expired') {
                            boxColor = 'bg-rose-50 border-rose-150 text-rose-900';
                            iconColor = 'text-rose-600';
                            title = 'Expired / Past Release Date';
                          } else if (countdown.status === 'due-today') {
                            boxColor = 'bg-amber-50 border-amber-200 text-amber-900';
                            iconColor = 'text-amber-600';
                            title = 'Releasing Today!';
                          } else if (countdown.status === 'soon') {
                            boxColor = 'bg-amber-50/60 border-amber-100 text-amber-900';
                            iconColor = 'text-amber-500';
                            title = 'Nearing Rent Term Release';
                          } else if (countdown.status === 'distant') {
                            boxColor = 'bg-indigo-50/50 border-indigo-100 text-indigo-950';
                            iconColor = 'text-indigo-600';
                            title = 'Tenancy Stable (Active)';
                          }

                          return (
                            <div className={`border rounded-xl p-4 flex gap-3.5 ${boxColor}`} id="countdown-status-box">
                              <div className="bg-white/80 p-2.5 rounded-xl shrink-0 h-fit shadow-xs">
                                <Clock className={`w-5 h-5 ${iconColor}`} />
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Availability Forecast</p>
                                <p className="text-lg font-black font-mono mt-0.5">{countdown.label}</p>
                                <p className="text-xs opacity-90 mt-1 text-slate-600 leading-snug">
                                  {title}. Starts {formatDate(activeBooking.startDate)} &bull; Release schedule {formatDate(activeBooking.endDate)}.
                                </p>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Tenant Profile details */}
                        <div className="border border-slate-100 rounded-xl p-4 space-y-3.5 bg-slate-50/40">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tenant Profile Sheet</p>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold font-mono">
                              AR
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 leading-none">Active Resident</p>
                              <p className="text-xs font-medium text-slate-400 mt-1">Resident since {formatDate(activeBooking.startDate)}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-1 text-xs border-t border-slate-100/60 mt-2">
                            <div>
                              <span className="text-slate-400 font-medium block">Phone Contact</span>
                              <p className="text-slate-500 font-semibold font-mono mt-0.5 flex items-center gap-1 italic">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                +1 (***) ***-****
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-400 font-medium block">Email Address</span>
                              <p className="text-slate-500 font-mono font-semibold truncate mt-0.5 flex items-center gap-1 italic" title="Confidential">
                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                *****@********.***
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100/60 mt-1 text-xs">
                            <div>
                              <span className="text-slate-400 block">Negotiated Rent</span>
                              <span className="text-slate-900 font-bold font-mono text-sm block mt-0.5">{formatCurrency(activeBooking.rentAmount)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Deposit Saved</span>
                              <span className="text-slate-900 font-bold font-mono text-sm block mt-0.5">{formatCurrency(activeBooking.depositAmount)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Payment State</span>
                              <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded-sm mt-0.5 ${
                                activeBooking.paymentStatus === 'Paid' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                  : activeBooking.paymentStatus === 'Pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                  : 'bg-rose-50 text-rose-700 border border-rose-100'
                              }`}>
                                {activeBooking.paymentStatus}
                              </span>
                            </div>
                          </div>

                          {activeBooking.notes && (
                            <div className="pt-2 border-t border-slate-100/60 mt-1 text-xs">
                              <span className="text-slate-400 block font-medium">Internal Covenants/Notes:</span>
                              <p className="text-slate-600 italic bg-white/75 p-2 rounded border border-slate-100/40 mt-1 leading-snug">
                                &ldquo;{activeBooking.notes}&rdquo;
                              </p>
                            </div>
                          )}

                        </div>

                      </div>
                    )}

                  </div>

                  {/* Room Traits Detail Specification */}
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2.5">Specifications Portfolio</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-lg flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">Max Guests</span>
                          <span className="font-bold text-slate-800">{selectedRoom.maxOccupants} Resident{selectedRoom.maxOccupants > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg flex items-center gap-2">
                        <div className="font-mono text-xs font-bold text-slate-450 bg-white border border-slate-200 w-6 h-6 rounded flex items-center justify-center">F</div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Floor level</span>
                          <span className="font-bold text-slate-800">Floor {selectedRoom.floor}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3.5">
                      <span className="text-[10px] text-slate-450 font-semibold block mb-1">Amenities Included</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedRoom.amenities.map(tag => (
                          <span key={tag} className="text-[10px] px-2.0 py-0.5 bg-slate-50 border border-slate-100 rounded text-slate-600 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 italic mt-3 bg-slate-50/50 p-3 rounded-lg leading-relaxed">
                      {selectedRoom.description}
                    </p>
                  </div>

                  {/* ACTION SHEETS (The controls depending on dynamic states) */}
                  <div className="pt-5 border-t border-slate-100 space-y-3" id="hud-actions-triggers">
                    <h4 className="text-[10px] uppercase font-bold text-slate-450 tracking-wider mb-3">Management Operations</h4>

                    {/* Lease Date Extension Accordion (if open) */}
                    {isExtending && activeBooking && (
                      <form onSubmit={handleExtendLease} className="p-4 bg-amber-50/60 border border-amber-100 rounded-xl space-y-3 animate-fade-in" id="lease-extension-form">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-amber-600" />
                            Extend Rental Release Date
                          </p>
                          <button 
                            type="button" 
                            onClick={() => { setIsExtending(false); setExtensionError(''); }}
                            className="text-xs text-slate-400 hover:text-slate-650"
                          >
                            Cancel
                          </button>
                        </div>

                        {extensionError && (
                          <p className="text-[11px] text-rose-600 font-semibold">{extensionError}</p>
                        )}

                        <div className="grid grid-cols-2 gap-2 items-end">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">New Release Date</label>
                            <input 
                              type="date"
                              required
                              value={newEndDate}
                              onChange={e => setNewEndDate(e.target.value)}
                              className="w-full text-xs border border-slate-200 rounded p-1.5 bg-white font-mono"
                            />
                          </div>
                          <button 
                            type="submit"
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-3 rounded cursor-pointer transition-all shrink-0 h-fit"
                          >
                            Save Extension
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400">Current terms end {formatDate(activeBooking.endDate)}.</p>
                      </form>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      
                      {/* Booking Actions */}
                      {selectedRoom.status === 'Available' && (
                        <button
                          onClick={() => {
                            setRoomToBook(selectedRoom);
                            setIsBookRoomOpen(true);
                          }}
                          className="col-span-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          id="btn-book-now"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Book / Rent Room Now
                        </button>
                      )}

                      {selectedRoom.status === 'Booked' && (
                        <>
                          <button
                            onClick={() => handleCheckoutTenant(selectedRoom.id)}
                            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            id="btn-checkout"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Release (Check-out)
                          </button>

                          <button
                            onClick={() => {
                              if (activeBooking) {
                                setNewEndDate(activeBooking.endDate);
                                setIsExtending(true);
                              }
                            }}
                            className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            id="btn-extend"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Extend Term
                          </button>
                        </>
                      )}

                      {/* Maintenance triggers */}
                      {selectedRoom.status !== 'Booked' && (
                        <button
                          onClick={() => toggleMaintenance(selectedRoom.id)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            selectedRoom.status === 'Maintenance'
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          id="btn-toggle-maintenance"
                        >
                          <Wrench className="w-3.5 h-3.5 animate-pulse" />
                          {selectedRoom.status === 'Maintenance' ? 'Finish Maintenance' : 'Lock Maintenance'}
                        </button>
                      )}

                      {/* Edit Specifications */}
                      <button
                        onClick={() => {
                          setRoomToEdit(selectedRoom);
                          setIsEditRoomOpen(true);
                        }}
                        className={`py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          selectedRoom.status === 'Booked' ? 'col-span-2' : ''
                        }`}
                        id="btn-edit-specs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Specifications
                      </button>

                      {/* Delete listing (Only if not active) */}
                      {selectedRoom.status !== 'Booked' && (
                        <button
                          onClick={() => handleDeleteRoom(selectedRoom.id, selectedRoom.roomNumber)}
                          className="col-span-2 mt-1 py-1.5 px-3 rounded-xl hover:bg-rose-50 text-rose-600 text-xs font-medium border border-transparent hover:border-rose-150 transition-all flex items-center justify-center gap-1 cursor-pointer"
                          id="btn-delete-room"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Room Listing
                        </button>
                      )}

                    </div>

                  </div>

                  {/* HISTORICAL ARCHIVE LOG (audit trail of old bookings for this selected room) */}
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-450 tracking-wider mb-2">History & Ledger logs</h4>
                    {historicBookings.length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50/50 p-3 rounded-lg text-center border border-dashed border-slate-100/50">
                        No previous booking sessions recorded.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1" id="ledger-history-scroller">
                        {historicBookings.map(b => (
                          <div key={b.id} className="text-xs p-2.5 rounded-lg border border-slate-100 bg-slate-50/20 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-700">Past Tenant Account</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Term: {formatDate(b.startDate)} - {formatDate(b.endDate)}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-slate-800 font-mono block">{formatCurrency(b.rentAmount)}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{b.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center" id="empty-selection-placeholder">
                <Compass className="w-10 h-10 text-slate-350 mx-auto mb-3 animate-spin-slow" />
                <p className="text-sm font-semibold text-slate-600">No Target Room Selected</p>
                <p className="text-xs text-slate-400 mt-1">Pick a vacancy from the rental grid on the left to review lease details.</p>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* --- Overlay Modals Component Mountings --- */}
      
      {/* 1. ADD ROOM FORM MODAL */}
      <AddRoomModal 
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        onSave={handleAddRoom}
        existingRooms={rooms}
      />

      {/* 2. BOOK TENANT FORM MODAL */}
      <BookRoomModal 
        isOpen={isBookRoomOpen}
        onClose={() => {
          setIsBookRoomOpen(false);
          setRoomToBook(null);
        }}
        room={roomToBook}
        onSave={handleBookRoom}
        todayDate={todayDate}
      />

      {/* 3. EDIT ROOM FORM MODAL */}
      <EditRoomModal 
        isOpen={isEditRoomOpen}
        onClose={() => {
          setIsEditRoomOpen(false);
          setRoomToEdit(null);
        }}
        room={roomToEdit}
        onSave={handleEditRoom}
      />

    </div>
  );
}
