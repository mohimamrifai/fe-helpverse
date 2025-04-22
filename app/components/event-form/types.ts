export interface TicketType {
  id: string;
  name: string;
  price: string;
  limit: string;
  rows?: number;
  columns?: number;
}

export interface Section {
  id: string;
  name: string;
  capacity: number;
  rows: number;
  columns: number;
  seats: Seat[][];
  price: number;
}

export interface Seat {
  id: string;
  status: 'available' | 'reserved' | 'selected';
  price?: number;
}

export interface EventDetails {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
}

export interface NewSection {
  name: string;
  rows: number;
  columns: number;
  price: number;
} 