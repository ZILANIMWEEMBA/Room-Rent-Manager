import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Room, RoomType, RoomStatus } from '../types';
import { AMENITIES_LIST } from '../data';

interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onSave: (room: Room) => void;
}

export const EditRoomModal: React.FC<EditRoomModalProps> = ({
  isOpen,
  onClose,
  room,
  onSave
}) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [type, setType] = useState<RoomType>('Single');
  const [rentAmount, setRentAmount] = useState<number>(0);
  const [floor, setFloor] = useState<number>(1);
  const [maxOccupants, setMaxOccupants] = useState<number>(1);
  const [status, setStatus] = useState<RoomStatus>('Available');
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (room) {
      setRoomNumber(room.roomNumber);
      setType(room.type);
      setRentAmount(room.rentAmount);
      setFloor(room.floor);
      setMaxOccupants(room.maxOccupants);
      setStatus(room.status);
      setDescription(room.description);
      setSelectedAmenities(room.amenities);
      setError('');
    }
  }, [room]);

  if (!isOpen || !room) return null;

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity) 
        : [...prev, amenity]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!roomNumber.trim()) {
      setError('Room number cannot be blank.');
      return;
    }

    if (rentAmount <= 0) {
      setError('Rent amount must be a positive number.');
      return;
    }

    onSave({
      ...room,
      roomNumber: roomNumber.trim(),
      type,
      rentAmount,
      floor,
      status, // Note: if they change to Booked manually, they should do it via Book Room, but we let them override or mark maintenance!
      maxOccupants,
      description: description.trim(),
      amenities: selectedAmenities
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="edit-room-modal-overlay">
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-100 overflow-hidden scale-in"
        id="edit-room-modal-container"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Room {room.roomNumber}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Modify properties and amenity tags for Room {room.roomNumber}.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            id="close-edit-room-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[75vh]" id="edit-room-form">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-lg">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Room Identifier */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Room Number / Name <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text"
                required
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-all"
                id="edit-room-number-input"
              />
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Classification Type
              </label>
              <select 
                value={type}
                onChange={e => setType(e.target.value as RoomType)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-medium"
                id="edit-room-type-select"
              >
                <option value="Single">Single Room</option>
                <option value="Double">Double Room</option>
                <option value="Suite">Premium Suite</option>
                <option value="Studio">Studio Apartment</option>
                <option value="Deluxe">Deluxe Room</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Monthly Rent (USD) <span className="text-rose-500">*</span>
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
                  id="edit-room-rent-input"
                />
              </div>
            </div>

            {/* Status (Note: safety checks in main controls warn if occupied/Booked) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Operational Status
              </label>
              <select 
                value={status}
                onChange={e => setStatus(e.target.value as RoomStatus)}
                disabled={room.status === 'Booked' && status !== 'Booked'} 
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium transition-all disabled:bg-slate-50 disabled:text-slate-400"
                id="edit-room-status-select"
              >
                <option value="Available">Available</option>
                <option value="Maintenance">Under Maintenance</option>
                <option value="Booked">Booked (Managed via Book Form)</option>
              </select>
              {room.status === 'Booked' && (
                <p className="text-[10px] text-slate-400 mt-1">To change status of a booked room, please use Check-out first.</p>
              )}
            </div>

            {/* Sizing Parameters */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                  Floor
                </label>
                <input 
                  type="number"
                  required
                  min="0"
                  value={floor}
                  onChange={e => setFloor(Number(e.target.value))}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-all"
                  id="edit-room-floor-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                  Max Capacity
                </label>
                <input 
                  type="number"
                  required
                  min="1"
                  value={maxOccupants}
                  onChange={e => setMaxOccupants(Number(e.target.value))}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-all"
                  id="edit-room-occupants-input"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
              Room Description & Internal Notes
            </label>
            <textarea 
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans"
              id="edit-room-desc-input"
            />
          </div>

          {/* Amenities Multi-Select */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
              Updated Utilities & Amenities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" id="edit-amenity-checkbox-group">
              {AMENITIES_LIST.map(amenity => {
                const checked = selectedAmenities.includes(amenity);
                return (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`flex items-center justify-between text-left text-xs px-3 py-2 rounded-lg border transition-all ${
                      checked 
                        ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-medium' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    id={`edit-amenity-toggle-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span>{amenity}</span>
                    {checked && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
              id="cancel-edit-room-btn"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1"
              id="submit-edit-room-btn"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
