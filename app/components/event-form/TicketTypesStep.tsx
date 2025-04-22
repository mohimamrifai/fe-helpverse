import React from 'react';
import { FaTicketAlt, FaTrashAlt, FaPlus } from 'react-icons/fa';
import { FormInput } from './FormInput';
import type { TicketType } from './types';

interface TicketTypesStepProps {
  ticketTypes: TicketType[];
  newTicketType: string;
  onNewTicketTypeChange: (value: string) => void;
  onAddTicketType: (e: React.FormEvent) => void;
  onRemoveTicketType: (id: string) => void;
  onTicketTypeChange: (id: string, field: keyof TicketType, value: string) => void;
  errors?: {[key: string]: string};
}

export function TicketTypesStep({
  ticketTypes,
  newTicketType,
  onNewTicketTypeChange,
  onAddTicketType,
  onRemoveTicketType,
  onTicketTypeChange,
  errors = {}
}: TicketTypesStepProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
          <FaTicketAlt className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-400" />
          Ticket Information
        </h2>
        
        {/* Add New Ticket Type */}
        <div className="flex gap-2 sm:gap-4 mt-3 sm:mt-4">
          <div className="flex-grow">
            <label htmlFor="newTicketType" className="sr-only">Add New Ticket Type</label>
            <input
              type="text"
              id="newTicketType"
              value={newTicketType}
              onChange={(e) => onNewTicketTypeChange(e.target.value)}
              className="mt-0 block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm transition duration-150 ease-in-out"
              placeholder="Enter new ticket type name"
            />
          </div>
          <button
            type="button"
            onClick={onAddTicketType}
            className="inline-flex items-center px-2 py-2 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <FaPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Add Ticket</span>
            <span className="xs:hidden">Add</span>
          </button>
        </div>

        {errors.ticketTypes && (
          <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.ticketTypes}</p>
        )}

        {/* Ticket Types List */}
        <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
          {ticketTypes.map((type, index) => (
            <div key={type.id} className="bg-gray-50 rounded-lg p-2 sm:p-4 space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs sm:text-sm font-medium text-gray-900 flex items-center">
                  <FaTicketAlt className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-400" />
                  {type.name}
                </h3>
                <button
                  type="button"
                  onClick={() => onRemoveTicketType(type.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <FaTrashAlt className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
              
              <div>
                <label htmlFor={`description-${type.id}`} className="block text-xs sm:text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  id={`description-${type.id}`}
                  value={type.description || ''}
                  onChange={(e) => onTicketTypeChange(type.id, 'description', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm transition duration-150 ease-in-out"
                  placeholder="Deskripsi tiket"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor={`price-${type.id}`} className="block text-xs sm:text-sm font-semibold text-gray-700">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-xs sm:text-sm">RM</span>
                    </div>
                    <input
                      type="number"
                      id={`price-${type.id}`}
                      value={type.price}
                      onChange={(e) => onTicketTypeChange(type.id, 'price', e.target.value)}
                      min="0"
                      required
                      className={`mt-0 block w-full pl-9 sm:pl-10 px-3 py-2 sm:px-4 sm:py-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm transition duration-150 ease-in-out ${errors[`ticket-${index}-price`] ? 'border-red-300 bg-red-50' : ''}`}
                      placeholder="0"
                    />
                    {errors[`ticket-${index}-price`] && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">{errors[`ticket-${index}-price`]}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor={`limit-${type.id}`} className="block text-xs sm:text-sm font-semibold text-gray-700">
                    Ticket Limit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id={`limit-${type.id}`}
                    value={type.limit}
                    onChange={(e) => onTicketTypeChange(type.id, 'limit', e.target.value)}
                    min="1"
                    required
                    className={`mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm transition duration-150 ease-in-out ${errors[`ticket-${index}-limit`] ? 'border-red-300 bg-red-50' : ''}`}
                    placeholder="Enter ticket limit"
                  />
                  {errors[`ticket-${index}-limit`] && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">{errors[`ticket-${index}-limit`]}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor={`category-${type.id}`} className="block text-xs sm:text-sm font-semibold text-gray-700">
                    Category
                  </label>
                  <select
                    id={`category-${type.id}`}
                    value={type.category || ''}
                    onChange={(e) => onTicketTypeChange(type.id, 'category', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm transition duration-150 ease-in-out"
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                    <option value="VVIP">VVIP</option>
                    <option value="Economy">Economy</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={`maxPerOrder-${type.id}`} className="block text-xs sm:text-sm font-semibold text-gray-700">
                    Max Per Order
                  </label>
                  <input
                    type="number"
                    id={`maxPerOrder-${type.id}`}
                    value={type.maxPerOrder || '4'}
                    onChange={(e) => onTicketTypeChange(type.id, 'maxPerOrder', e.target.value)}
                    min="1"
                    className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm transition duration-150 ease-in-out"
                    placeholder="Maksimal pembelian per order"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor={`saleEndDate-${type.id}`} className="block text-xs sm:text-sm font-semibold text-gray-700">
                  Sale End Date
                </label>
                <input
                  type="date"
                  id={`saleEndDate-${type.id}`}
                  value={type.saleEndDate || ''}
                  onChange={(e) => onTicketTypeChange(type.id, 'saleEndDate', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm transition duration-150 ease-in-out"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 