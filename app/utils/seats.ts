import type { Event, Ticket } from '~/services/event';
import type { GeneratedSeat } from '~/components/event/SeatMap';

/**
 * Generates seats from available tickets in an event
 * @param event Event data
 * @returns Array of GeneratedSeat
 */
export function generateSeatsFromTickets(event: Event): GeneratedSeat[] {
  if (!event.tickets || event.tickets.length === 0) return [];

  const allSeats: GeneratedSeat[] = [];

  // For each ticket type, create seats based on rows and columns
  event.tickets.forEach(ticket => {
    if (!ticket.seatArrangement) return;

    const { rows, columns } = ticket.seatArrangement;
    
    // Use letters for rows (A, B, C, ...)
    const rowLabels = Array.from({ length: rows }, (_, i) => 
      String.fromCharCode(65 + i)
    );

    // For each row and column, create a seat
    rowLabels.forEach(row => {
      for (let col = 1; col <= columns; col++) {
        const seatId = `${row}${col}`;
        
        // Check if seat is already booked
        const isBooked = ticket.bookedSeats?.some(
          bookedSeat => 
            (typeof bookedSeat === 'string' && bookedSeat === seatId) ||
            (typeof bookedSeat === 'object' && 
              bookedSeat.row.toString() === row.toString() && 
              bookedSeat.column.toString() === String(col))
        ) || false;

        allSeats.push({
          id: seatId,
          row,
          column: String(col),
          status: isBooked ? 'booked' : 'available',
          price: ticket.price,
          ticketTypeId: ticket._id
        });
      }
    });
  });

  return allSeats;
}

/**
 * Formats currency to Malaysian Ringgit format
 * @param amount Amount in number or string
 * @returns Formatted string (e.g., "RM 25.00")
 */
export function formatRinggit(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `RM ${numAmount.toFixed(2)}`;
}

/**
 * Formats date to a more readable format
 * @param dateString Date as string or Date object
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return String(dateString);
  }
} 