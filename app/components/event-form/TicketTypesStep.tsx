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
}

export function TicketTypesStep({
  ticketTypes,
  newTicketType,
  onNewTicketTypeChange,
  onAddTicketType,
  onRemoveTicketType,
  onTicketTypeChange
}: TicketTypesStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaTicketAlt className="h-5 w-5 mr-2 text-gray-400" />
          Ticket Information
        </h2>
        
        {/* Add New Ticket Type */}
        <div className="flex gap-4 mt-4">
          <div className="flex-grow">
            <label htmlFor="newTicketType" className="sr-only">Add New Ticket Type</label>
            <input
              type="text"
              id="newTicketType"
              value={newTicketType}
              onChange={(e) => onNewTicketTypeChange(e.target.value)}
              className="mt-2 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm transition duration-150 ease-in-out"
              placeholder="Enter new ticket type name"
            />
          </div>
          <button
            type="button"
            onClick={onAddTicketType}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <FaPlus className="h-4 w-4 mr-2" />
            Add Ticket Type
          </button>
        </div>

        {/* Ticket Types List */}
        <div className="space-y-4 mt-6">
          {ticketTypes.map((type) => (
            <div key={type.id} className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900 flex items-center">
                  <FaTicketAlt className="h-4 w-4 mr-2 text-gray-400" />
                  {type.name}
                </h3>
                <button
                  type="button"
                  onClick={() => onRemoveTicketType(type.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <FaTrashAlt className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`price-${type.id}`} className="block text-sm font-semibold text-gray-700">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rp</span>
                    </div>
                    <input
                      type="number"
                      id={`price-${type.id}`}
                      value={type.price}
                      onChange={(e) => onTicketTypeChange(type.id, 'price', e.target.value)}
                      min="0"
                      required
                      className="mt-2 block w-full pl-10 px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm transition duration-150 ease-in-out"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor={`limit-${type.id}`} className="block text-sm font-semibold text-gray-700">
                    Ticket Limit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id={`limit-${type.id}`}
                    value={type.limit}
                    onChange={(e) => onTicketTypeChange(type.id, 'limit', e.target.value)}
                    min="1"
                    required
                    className="mt-2 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm transition duration-150 ease-in-out"
                    placeholder="Enter ticket limit"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 