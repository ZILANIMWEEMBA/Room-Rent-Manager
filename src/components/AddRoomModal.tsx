import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Room, RoomType } from '../types';
import { AMENITIES_LIST } from '../data';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (room: Omit<Room, 'id'>) => void;
  existingRooms: Room[];
}

export const AddRoomModal: React.FC<AddRoomModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  existingRooms 
}) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [type, setType] = useState<RoomType>('Single');
  const [rentAmount, setRentAmount] = useState<number>(350);
  const [floor, setFloor] = useState<number>(1);
  const [maxOccupants, setMaxOccupants] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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

    // Field Validation
    if (!roomNumber.trim()) {
      setError('Room number is required.');
      return;
    }

    const exists = existingRooms.some(r => r.roomNumber.toLowerCase() === roomNumber.trim().toLowerCase());
    if (exists) {
      setError(`Room number "${roomNumber}" already exists.`);
      return;
    }

    if (rentAmount <= 0) {
      setError('Rent amount must be a positive number.');
      return;
    }

    if (maxOccupants <= 0) {
      setError('Maximum occupants must be at least 1.');
      return;
    }

    // Call onSave
    onSave({
      roomNumber: roomNumber.trim(),
      type,
      rentAmount,
      floor,
      maxOccupants,
      description: description.trim() || `Clean modern ${type.toLowerCase()} room on floor ${floor}.`,
      status: 'Available',
      amenities: selectedAmenities
    });

    // Reset Form
    setRoomNumber('');
    setType('Single');
    setRentAmount(350);
    setFloor(1);
    setMaxOccupants(1);
    setDescription('');
    setSelectedAmenities([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="add-room-modal-overlay">
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-100 overflow-hidden scale-in"
        id="add-room-modal-container"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add New Rental Room</h2>
            <p className="text-xs text-slate-500 mt-0.5">Register a new room available for rental tenancy listings.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            id="close-add-room-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[75vh]" id="add-room-form">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-lg flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Room Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Room Number / Name <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text"
                required
                placeholder="e.g. 105, Studio-A"
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-all"
                id="add-room-number-input"
              />
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Room Type
              </label>
              <select 
                value={type}
                onChange={e => {
                  const val = e.target.value as RoomType;
                  setType(val);
                  // Update logical default rents & occupancy based on type
                  if (val === 'Single') { setRentAmount(350); setMaxOccupants(1); }
                  else if (val === 'Double') { setRentAmount(500); setMaxOccupants(2); }
                  else if (val === 'Suite') { setRentAmount(850); setMaxOccupants(3); }
                  else if (val === 'Studio') { setRentAmount(600); setMaxOccupants(1); }
                  else if (val === 'Deluxe') { setRentAmount(700); setMaxOccupants(2); }
                }}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-medium"
                id="add-room-type-select"
              >
                <option value="Single">Single Room</option>
                <option value="Double">Double Room</option>
                <option value="Suite">Premium Suite</option>
                <option value="Studio">Studio Apartment</option>
                <option value="Deluxe">Deluxe Room</option>
              </select>
            </div>

            {/* Monthly Rent */}
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
                  placeholder="350"
                  value={rentAmount || ''}
                  onChange={e => setRentAmount(Number(e.target.value))}
                  className="w-full text-sm border border-slate-200 rounded-lg pl-7 pr-3 py-2 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-all"
                  id="add-room-rent-input"
                />
              </div>
            </div>

            {/* Sizing Parameters (Floor & Max Occupants) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                  Floor
                </label>
                <input 
                  type="number"
                  required
                  min="0"
                  max="12"
                  value={floor}
                  onChange={e => setFloor(Number(e.target.value))}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-all"
                  id="add-room-floor-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                  Max Occupants
                </label>
                <input 
                  type="number"
                  required
                  min="1"
                  max="8"
                  value={maxOccupants}
                  onChange={e => setMaxOccupants(Number(e.target.value))}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-all"
                  id="add-room-occupants-input"
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
              placeholder="Describe room view, size, special features, kitchen presence, or specific house rules..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
              id="add-room-desc-input"
            />
          </div>

          {/* Amenities Multi-Select */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
              Included Utilities & Amenities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" id="amenity-checkbox-group">
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
                    id={`amenity-toggle-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
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
              id="cancel-add-room-btn"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1"
              id="submit-add-room-btn"
            >
              Add Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
