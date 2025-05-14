import React from 'react';

interface WaitlistTicketModalProps {
  isOpen: boolean;
  eventId: string;
  onClose: () => void;
}

export const WaitlistTicketModal: React.FC<WaitlistTicketModalProps> = ({ isOpen, eventId, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Waitlist Ticket</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Tambahkan tiket waitlist untuk event ini. Tiket waitlist akan digunakan jika semua tiket utama telah habis terjual.
          </p>
          
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4">
            <p className="text-sm text-yellow-800">
              Fitur ini masih dalam pengembangan. Segera hadir di HELPVerse!
            </p>
          </div>
          
          <p className="text-gray-600 text-sm">
            Event ID: {eventId}
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 mr-2"
          >
            Batal
          </button>
          <button
            className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600"
            onClick={() => {
              alert('Fitur masih dalam pengembangan');
              onClose();
            }}
          >
            Tambah Tiket Waitlist
          </button>
        </div>
      </div>
    </div>
  );
}; 