import React, { useState } from 'react';
import type { TicketType } from './types';

interface SeatArrangementStepProps {
  ticketTypes: TicketType[];
  onSeatLayoutChange: (ticketId: string, rows: number, columns: number) => void;
  errors?: {[key: string]: string};
}

export function SeatArrangementStep({
  ticketTypes,
  onSeatLayoutChange,
  errors = {}
}: SeatArrangementStepProps) {
  const [editingTicket, setEditingTicket] = useState<string | null>(null);
  const [layoutConfig, setLayoutConfig] = useState({
    rows: 0,
    columns: 0
  });

  // Calculate rows and columns for each ticket type
  const getSeatLayout = (limit: number, ticketId: string) => {
    const ticket = ticketTypes.find(t => t.id === ticketId);
    if (ticket && ticket.rows && ticket.columns) {
      return { rows: ticket.rows, columns: ticket.columns };
    }
    const rows = Math.ceil(Math.sqrt(limit));
    const columns = Math.ceil(limit / rows);
    return { rows, columns };
  };

  const handleLayoutSubmit = (e: React.FormEvent, ticketId: string) => {
    e.preventDefault();
    const ticket = ticketTypes.find(t => t.id === ticketId);
    if (ticket && layoutConfig.rows * layoutConfig.columns >= parseInt(ticket.limit)) {
      onSeatLayoutChange(ticketId, layoutConfig.rows, layoutConfig.columns);
      setEditingTicket(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Seat Preview</h2>
        </div>

        {errors.seatArrangement && (
          <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs sm:text-sm text-red-600">{errors.seatArrangement}</p>
          </div>
        )}

        <div className={`bg-gray-50 border-2 border-dashed ${errors.seatArrangement ? 'border-red-300' : 'border-gray-300'} rounded-lg p-2 sm:p-4 md:p-6`}>
          {ticketTypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <svg className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-xs sm:text-sm text-gray-500 text-center mb-4">No ticket types available</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Stage area */}
              <div className="bg-gray-300 text-center py-1 sm:py-2 mb-2 sm:mb-4 text-xs sm:text-sm text-gray-700 font-medium max-w-xl mx-auto">
                STAGE
              </div>

              {/* Seat legend */}
              <div className="flex justify-center space-x-2 sm:space-x-4 mb-2 sm:mb-4">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 rounded"></div>
                  <span className="text-xs sm:text-sm">Available</span>
                </div>
              </div>

              {/* Ticket Type Sections */}
              {ticketTypes.map(ticketType => {
                const { rows, columns } = getSeatLayout(parseInt(ticketType.limit), ticketType.id);
                const totalSeats = rows * columns;
                
                return (
                  <div key={ticketType.id} className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <h3 className="text-sm sm:text-base font-medium">{ticketType.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">{ticketType.limit} seats total</p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-right">
                          <p className="text-xs sm:text-sm font-medium text-gray-900">
                            RM {parseInt(ticketType.price).toLocaleString()}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">per seat</p>
                        </div>
                        <button
                          onClick={() => {
                            setEditingTicket(ticketType.id);
                            setLayoutConfig({ 
                              rows: ticketType.rows || Math.ceil(Math.sqrt(parseInt(ticketType.limit))), 
                              columns: ticketType.columns || Math.ceil(parseInt(ticketType.limit) / Math.ceil(Math.sqrt(parseInt(ticketType.limit)))) 
                            });
                          }}
                          className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Configure Layout
                        </button>
                      </div>
                    </div>

                    {editingTicket === ticketType.id && (
                      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                        <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-4">Configure Seat Layout</h4>
                        <form onSubmit={(e) => handleLayoutSubmit(e, ticketType.id)} className="space-y-3 sm:space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-1 sm:space-y-2">
                              <label htmlFor="rows" className="block text-xs sm:text-sm font-medium text-gray-700">
                                Number of Rows
                              </label>
                              <div className="relative rounded-md shadow-sm">
                                <input
                                  type="number"
                                  name="rows"
                                  id="rows"
                                  min="0"
                                  value={layoutConfig.rows}
                                  onChange={(e) => setLayoutConfig(prev => ({ ...prev, rows: parseInt(e.target.value) || 0 }))}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm p-2"
                                  required
                                />
                              </div>
                              <p className="text-xs text-gray-500">
                                Total seats: {layoutConfig.rows * layoutConfig.columns}
                              </p>
                            </div>
                            <div className="space-y-1 sm:space-y-2">
                              <label htmlFor="columns" className="block text-xs sm:text-sm font-medium text-gray-700">
                                Seats per Row
                              </label>
                              <div className="relative rounded-md shadow-sm">
                                <input
                                  type="number"
                                  name="columns"
                                  id="columns"
                                  min="0"
                                  value={layoutConfig.columns}
                                  onChange={(e) => setLayoutConfig(prev => ({ ...prev, columns: parseInt(e.target.value) || 0 }))}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm p-2"
                                  required
                                />
                              </div>
                              <p className="text-xs text-gray-500">
                                Minimum required: {Math.ceil(parseInt(ticketType.limit) / layoutConfig.rows)}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2 sm:space-x-3 pt-2 sm:pt-4">
                            <button
                              type="button"
                              onClick={() => setEditingTicket(null)}
                              className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={layoutConfig.rows * layoutConfig.columns < parseInt(ticketType.limit)}
                              className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Save Layout
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Seat grid - untuk layar lebih kecil, kita buat seat grid lebih kecil */}
                    <div className="flex justify-center overflow-auto">
                      <div className="flex flex-col items-center">
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                          <div key={rowIndex} className="flex items-center justify-center my-0.5 sm:my-1">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center text-[8px] sm:text-[10px] font-bold">
                              {String.fromCharCode(65 + rowIndex)}
                            </div>
                            <div className="flex">
                              {Array.from({ length: columns }).map((_, colIndex) => {
                                const seatNumber = rowIndex * columns + colIndex + 1;
                                const isAvailable = seatNumber <= parseInt(ticketType.limit);
                                
                                return (
                                  <div
                                    key={colIndex}
                                    className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-sm text-[8px] sm:text-[10px] flex items-center justify-center mx-0.5 ${
                                      isAvailable 
                                        ? 'bg-green-100' 
                                        : 'bg-gray-100'
                                    }`}
                                  >
                                    {colIndex + 1}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center text-[8px] sm:text-[10px] font-bold">
                              {String.fromCharCode(65 + rowIndex)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}