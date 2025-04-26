import { Link } from 'react-router';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import type { Event } from '~/services/event';
import type { GeneratedSeat } from './SeatMap';

interface EventSummaryProps {
  event: Event;
  selectedSeats: string[];
  generatedSeats: GeneratedSeat[];
  onRemoveSelection: () => void;
  eventId: string;
}

export default function EventSummary({
  event,
  selectedSeats,
  generatedSeats,
  onRemoveSelection,
  eventId,
}: EventSummaryProps) {

  // Get the actual seat IDs from the combined format "ticketTypeId:seatId"
  const getActualSeatIds = () => {
    return selectedSeats.map(combinedId => {
      const parts = combinedId.split(':');
      return parts.length > 1 ? parts[1] : combinedId;
    });
  };

  // Get the ticket names for selected seats
  const getSelectedTicketNames = () => {
    if (selectedSeats.length === 0 || generatedSeats.length === 0 || !event.tickets) {
      return '';
    }

    const ticketNames = selectedSeats.map(combinedId => {
      const parts = combinedId.split(':');
      const ticketTypeId = parts.length > 1 ? parts[0] : '';
      const seatId = parts.length > 1 ? parts[1] : combinedId;
      
      const seat = generatedSeats.find(s => s.id === seatId && s.ticketTypeId === ticketTypeId);
      if (!seat) return '';
      
      const ticket = event.tickets.find(t => t._id === seat.ticketTypeId);
      return ticket ? ticket.name : '';
    }).filter(Boolean);

    // Return unique ticket names
    return [...new Set(ticketNames)].join(', ');
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!generatedSeats || generatedSeats.length === 0) return 0;

    let total = 0;

    // Find price for each selected seat
    selectedSeats.forEach(combinedId => {
      const parts = combinedId.split(':');
      if (parts.length < 2) return;
      
      const ticketTypeId = parts[0];
      const seatId = parts[1];
      
      const seat = generatedSeats.find(s => 
        s.id === seatId && s.ticketTypeId === ticketTypeId
      );
      
      if (seat) {
        total += seat.price;
      }
    });

    return total;
  };

  // Prepare data to send to payment page
  const preparePaymentData = () => {
    return {
      eventData: {
        id: eventId,
        name: event.name,
        image: `http://localhost:5000/uploads/images/${event.image}`,
        date: typeof event.date === 'object' 
          ? event.date.toLocaleDateString('en-US', {day: 'numeric', month: 'long', year: 'numeric'})
          : event.date,
        time: event.time,
        location: event.location
      },
      selectedSeats: selectedSeats,
      selectedSeatsLabels: getActualSeatIds(),
      ticketType: getSelectedTicketNames(),
      totalPrice: calculateTotalPrice()
    };
  };
  
  // Prepare data to send to waitlist page
  const prepareWaitlistData = () => {
    return {
      eventData: {
        id: eventId,
        name: event.name,
        image: `http://localhost:5000/uploads/images/${event.image}`,
        date: typeof event.date === 'object' 
          ? event.date.toLocaleDateString('en-US', {day: 'numeric', month: 'long', year: 'numeric'})
          : event.date,
        time: event.time,
        location: event.location
      }
    };
  };

  return (
    <div className="bg-primary text-white rounded-lg p-4 md:p-6 h-fit">
      <div className="flex mb-4 gap-4">
        <img
          src={`http://localhost:5000/uploads/images/${event.image}`}
          alt={event.name}
          className="w-20 h-24 object-cover rounded flex-shrink-0"
        />
        <div className="flex flex-col min-w-0">
          <h2 className="text-lg font-bold line-clamp-2">{event.name}</h2>
          <div className="mt-2 space-y-2">
            <div className="flex items-start gap-2">
              <FaMapMarkerAlt className="w-4 h-4 opacity-80 flex-shrink-0 mt-0.5" />
              <span className="text-sm line-clamp-2">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="w-4 h-4 opacity-80 flex-shrink-0" />
              <span className="text-sm">
                {typeof event.date === 'object' 
                  ? event.date.toLocaleDateString('en-US', {day: 'numeric', month: 'long', year: 'numeric'})
                  : event.date}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="w-4 h-4 opacity-80 flex-shrink-0" />
              <span className="text-sm">{event.time}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-6">
        <h3 className="text-sm md:text-lg mb-1 md:mb-2">Seat Numbers</h3>
        <p className="text-gray-300 text-xs md:text-sm">
          {selectedSeats.length > 0
            ? getActualSeatIds().join(', ')
            : 'No seats selected yet'}
        </p>
        <p className="text-sm mt-1 font-bold">
          {selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'} selected
        </p>
        <p className='text-xs mt-1'>
          {selectedSeats.length > 0 ? getSelectedTicketNames() : 'Please select seats'}
        </p>
      </div>

      <div className="mt-6 md:mt-8">
        <div className="flex flex-col gap-3">
          <div className='flex gap-2'>
            <button
              onClick={onRemoveSelection}
              className="bg-gray-200 p-2 text-sm rounded-full font-bold text-primary cursor-pointer w-full"
              disabled={selectedSeats.length === 0}
            >
              Clear Selection
            </button>

            <Link
              to={selectedSeats.length > 0 ? `/event/${eventId}/payment` : '#'}
              state={selectedSeats.length > 0 ? preparePaymentData() : undefined}
              className={`bg-[#FEB32B] p-2 rounded-full font-bold text-white cursor-pointer w-full text-center text-sm ${
                selectedSeats.length === 0 ? 'cursor-not-allowed' : 'hover:translate-y-[-2px]'
              }`}
              onClick={(e) => {
                if (selectedSeats.length === 0) {
                  e.preventDefault();
                }
              }}
            >
              Next
            </Link>
          </div>

          <Link
            to={`/event/${eventId}/join-waitlist`}
            state={prepareWaitlistData()}
            className="bg-gray-200 p-2 rounded-full font-bold text-primary cursor-pointer text-center text-sm hover:bg-gray-300 transition-all"
          >
            Join Waitlist
          </Link>
        </div>
      </div>
    </div>
  );
} 