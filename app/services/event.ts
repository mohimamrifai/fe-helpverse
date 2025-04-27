import axios from 'axios';

// Definisi tipe untuk event
export interface Event {
  id: string;
  _id: string;
  name: string;           // Diubah dari title menjadi name sesuai dokumentasi
  description: string;
  date: Date;             // Diubah dari string menjadi Date
  time: string;
  location: string;       // Diubah dari venue menjadi location
  address: string;
  image: string;
  totalSeats: number;
  availableSeats: number;
  tickets: Ticket[];      // Diubah dari ticketTypes menjadi tickets
  createdBy: User;        // Ditambahkan sesuai dokumentasi
  tags: string[];         // Ditambahkan sesuai dokumentasi
  published: boolean;
  approvalStatus: string;
  approvalNotes: string;
  promotionalOffers?: PromotionalOffer[];
  seatArrangement?: SeatArrangement;
  createdAt: Date;        // Diubah dari string menjadi Date
  updatedAt: Date;        // Ditambahkan sesuai dokumentasi
}

// Definisi tipe untuk tipe tiket
export interface Ticket {  // Diubah nama dari TicketType menjadi Ticket
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;          // Diubah dari string menjadi number
  quantity: number;       // Diubah dari available dan total menjadi quantity
  startDate?: Date;       // Ditambahkan sesuai dokumentasi
  endDate?: Date;         // Ditambahkan sesuai dokumentasi
  seatArrangement?: {
    rows: number;
    columns: number;
  };
  bookedSeats?: BookedSeat[]; // Ditambahkan sesuai dokumentasi
}

// Definisi tipe untuk kursi yang sudah dipesan
export interface BookedSeat {
  row: number;
  column: number;
  bookingId: string;
}

// Definisi tipe untuk pengaturan kursi
export interface SeatArrangement {
  rows: number;
  columns: number;
  seats: SeatInfo[];
}

// Definisi tipe untuk informasi kursi
export interface SeatInfo {
  id: string;
  row: string;
  column: string;
  status: 'available' | 'reserved' | 'selected' | 'booked';
  price: number;
  ticketTypeId?: string;
}

// Definisi tipe untuk user
export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  organizerName?: string;
  role: 'user' | 'eventOrganizer' | 'admin';
}

// Definisi tipe untuk organizer (deprecated - digantikan User)
export interface Organizer {
  _id: string;
  name: string;
  email: string;
}

// Definisi tipe untuk promotional offer
export interface PromotionalOffer {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number;
  currentUses: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
}

// Definisi tipe untuk parameter booking
export interface BookingParams {
  ticketTypeId: string;
  seats: string[];
  quantity: number;
}

// Base URL dari API
const API_URL = 'http://localhost:5000';

// Fungsi untuk mengambil token dari localStorage
const getToken = () => localStorage.getItem('token');

// Axios instance dengan header Authorization
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token pada setiap request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Adapter untuk mengubah format event
const normalizeEvent = (eventData: any): Event => {
  // Pastikan tickets adalah array
  const tickets = Array.isArray(eventData.tickets) 
    ? eventData.tickets
    : (Array.isArray(eventData.ticketTypes) ? eventData.ticketTypes : []);
  
  // Petakan tiket untuk memastikan semua properti yang dibutuhkan ada
  const normalizedTickets = tickets.map((ticket: any) => {
    // Jika tiket hanya berupa ID string, buat objek kosong
    if (typeof ticket === 'string') {
      return {
        _id: ticket,
        id: ticket,
        name: `Tiket ${ticket.substr(-4)}`,
        description: '',
        price: 0,
        quantity: 0,
        seatArrangement: {
          rows: 0,
          columns: 0,
        },
        bookedSeats: []
      };
    }
    
    return {
      _id: ticket._id || ticket.id,
      id: ticket.id || ticket._id,
      name: ticket.name || `Tiket ${(ticket._id || ticket.id).substr(-4)}`,
      description: ticket.description || '',
      price: typeof ticket.price === 'string' ? parseFloat(ticket.price) : (ticket.price || 0),
      quantity: ticket.quantity || ticket.available || 0,
      startDate: ticket.startDate ? new Date(ticket.startDate) : undefined,
      endDate: ticket.endDate ? new Date(ticket.endDate) : undefined,
      seatArrangement: {
        rows: ticket.rows || (ticket.seatArrangement?.rows || 0),
        columns: ticket.columns || (ticket.seatArrangement?.columns || 0),
      },
      bookedSeats: Array.isArray(ticket.bookedSeats) ? ticket.bookedSeats : []
    };
  });
  
  // Tambahkan ticketTypeId ke seats jika belum ada
  const seatArrangement = eventData.seatArrangement 
    ? {
        rows: eventData.seatArrangement.rows,
        columns: eventData.seatArrangement.columns,
        seats: Array.isArray(eventData.seatArrangement.seats) 
          ? eventData.seatArrangement.seats.map((seat: any) => {
              const result = {
                id: seat.id,
                row: seat.row,
                column: seat.column,
                status: seat.status || 'available',
                price: seat.price || 0,
                ticketTypeId: seat.ticketTypeId
              };
              return result;
            })
          : []
      }
    : { rows: 0, columns: 0, seats: [] };
    
  // Buat user dari data organizer jika tidak ada
  const user = eventData.createdBy || {
    _id: eventData.organizer?._id || '',
    username: '',
    email: eventData.organizer?.email || '',
    fullName: eventData.organizer?.name || '',
    phone: '',
    role: 'eventOrganizer' as const
  };

  return {
    id: eventData.id || eventData._id,
    _id: eventData._id || eventData.id,
    name: eventData.name || eventData.title,
    description: eventData.description,
    date: new Date(eventData.date),
    time: eventData.time,
    location: eventData.location || eventData.venue,
    address: eventData.address || '',
    image: eventData.image,
    totalSeats: eventData.totalSeats || eventData.capacity || 0,
    availableSeats: eventData.availableSeats || 0,
    tickets: normalizedTickets,
    createdBy: user,
    tags: Array.isArray(eventData.tags) ? eventData.tags : [],
    published: eventData.published || false,
    approvalStatus: eventData.approvalStatus || 'pending',
    approvalNotes: eventData.approvalNotes || '',
    promotionalOffers: Array.isArray(eventData.promotionalOffers) 
      ? eventData.promotionalOffers.map((offer: any) => ({
          _id: offer._id || '',
          code: offer.code,
          discountType: offer.discountType as 'percentage' | 'fixed',
          discountValue: offer.discountValue,
          maxUses: offer.maxUses,
          currentUses: offer.currentUses,
          validFrom: offer.validFrom,
          validUntil: offer.validUntil,
          active: offer.active
        }))
      : [],
    seatArrangement: seatArrangement,
    createdAt: new Date(eventData.createdAt || new Date()),
    updatedAt: new Date(eventData.updatedAt || new Date())
  };
};

export const eventService = {
  // Fungsi untuk mengambil semua event
  async getAllEvents(page = 1, limit = 10, search = ''): Promise<{ events: Event[], total: number, page: number, limit: number }> {
    try {
      const params = { page, limit, search };
      const response = await api.get('/api/events', { params });
      
      if (response.data.success) {
        // Mengubah format API ke format yang diharapkan di frontend
        const events = response.data.data.map((event: any) => normalizeEvent(event));
        return {
          events,
          total: response.data.count || events.length,
          page,
          limit
        };
      }
      
      throw new Error(response.data.message || 'Failed to fetch events');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch events');
      }
      throw error;
    }
  },

  // Fungsi untuk mengambil detail event berdasarkan ID
  async getEventById(id: string): Promise<Event> {
    try {
      console.log(`Memanggil API untuk event dengan ID: ${id}`);
      const response = await api.get(`/api/events/${id}`);
      
      if (response.data.success) {
        const eventData = response.data.data;
        console.log('Data acara dari API:', JSON.stringify(eventData, null, 2));
        
        // Jika tidak ada seatArrangement atau seats array kosong, buat data dummy
        if (!eventData.seatArrangement || !eventData.seatArrangement.seats || eventData.seatArrangement.seats.length === 0) {
          console.log('Membuat data tempat duduk dummy berdasarkan dokumentasi API');
          
          // Tentukan jumlah baris dan kolom berdasarkan ticket types
          let totalRows = 0;
          let totalColumns = 0;
          
          // Jika ada ticket types dengan properti rows dan columns, gunakan itu
          if ((eventData.tickets && eventData.tickets.length > 0) || 
              (eventData.ticketTypes && eventData.ticketTypes.length > 0)) {
            // Gunakan ticket atau ticketTypes
            const ticketsData = eventData.tickets || eventData.ticketTypes;
            
            // Urutkan tiket dari yang termahal ke termurah
            const sortedTickets = [...ticketsData].sort((a, b) => {
              const priceA = typeof a.price === 'string' ? parseFloat(a.price) : (a.price || 0);
              const priceB = typeof b.price === 'string' ? parseFloat(b.price) : (b.price || 0);
              return priceB - priceA;
            });
            
            console.log('Tiket diurutkan berdasarkan harga:', sortedTickets);
            
            // Kelompokkan tiket ke kategori
            const vvipTickets = sortedTickets.filter(ticket => 
              (ticket.name && ticket.name.toLowerCase().includes('vvip')) || 
              (ticket.category && ticket.category.toLowerCase().includes('vvip'))
            );
            
            const vipTickets = sortedTickets.filter(ticket => 
              (ticket.name && ticket.name.toLowerCase().includes('vip') && !ticket.name.toLowerCase().includes('vvip')) || 
              (ticket.category && ticket.category.toLowerCase().includes('vip') && !ticket.category.toLowerCase().includes('vvip'))
            );
            
            const regularTickets = sortedTickets.filter(ticket => 
              (!ticket.name || (!ticket.name.toLowerCase().includes('vip'))) && 
              (!ticket.category || (!ticket.category.toLowerCase().includes('vip')))
            );
            
            const ticketCategories = [
              { name: 'VVIP', tickets: vvipTickets.length > 0 ? vvipTickets : [sortedTickets[0]], rowPrefix: 'I', rows: 3 },
              { name: 'VIP', tickets: vipTickets.length > 0 ? vipTickets : (sortedTickets.length > 1 ? [sortedTickets[1]] : []), rowPrefix: 'F', rows: 3 },
              { name: 'Regular', tickets: regularTickets.length > 0 ? regularTickets : (sortedTickets.length > 2 ? [sortedTickets[2]] : []), rowPrefix: 'A', rows: 5 }
            ];
            
            // Buat kursi dummy untuk setiap kategori
            interface DummySeat {
              id: string;
              row: string;
              column: string;
              status: 'available' | 'reserved' | 'selected';
              price: number;
              ticketTypeId?: string;
            }
            
            const dummySeats: DummySeat[] = [];
            
            ticketCategories.forEach(category => {
              if (category.tickets.length === 0) return;
              
              category.tickets.forEach(ticket => {
                // Gunakan rows dan columns dari tiket jika ada, atau default values
                const rows = ticket.rows || category.rows || 3;
                const columns = ticket.columns || Math.ceil(parseInt(ticket.limit || '10') / rows) || 10;
                
                // Tambah ke total
                totalRows += rows;
                totalColumns = Math.max(totalColumns, columns);
                
                // Buat row labels
                const rowLabels = [];
                for (let i = 0; i < rows; i++) {
                  rowLabels.push(String.fromCharCode(category.rowPrefix.charCodeAt(0) + i));
                }
                
                // Buat kursi untuk tiap baris dan kolom
                rowLabels.forEach(rowLabel => {
                  for (let c = 1; c <= columns; c++) {
                    const seatId = `${rowLabel}${c}`;
                    // Buat status acak: 'available', 'reserved', atau 'selected'
                    const randomStatus = Math.random() < 0.8 ? 'available' : 
                                        Math.random() < 0.5 ? 'reserved' : 'selected';
                    
                    // Harga berdasarkan tiket
                    const price = typeof ticket.price === 'string' ? parseFloat(ticket.price) : (ticket.price || 0);
                    
                    dummySeats.push({
                      id: seatId,
                      row: rowLabel,
                      column: c.toString(),
                      status: randomStatus,
                      price: price,
                      ticketTypeId: ticket._id || ticket.id // Simpan ID tiket untuk referensi
                    });
                  }
                });
              });
            });
            
            // Jika eventData.seatArrangement tidak ada, buat objek baru
            if (!eventData.seatArrangement) {
              eventData.seatArrangement = {
                rows: totalRows,
                columns: totalColumns,
                seats: dummySeats
              };
            } else {
              // Jika ada tapi seats array kosong, isi dengan data dummy
              eventData.seatArrangement.rows = totalRows;
              eventData.seatArrangement.columns = totalColumns;
              eventData.seatArrangement.seats = dummySeats;
            }
            
            console.log(`Membuat ${dummySeats.length} kursi dummy untuk ${ticketCategories.filter(c => c.tickets.length > 0).length} kategori tiket`);
          } else {
            // Fallback jika tidak ada ticketTypes
            // Gunakan rows dan columns dari dokumentasi jika tidak ada
            const rows = eventData.seatArrangement?.rows || 10;
            const columns = eventData.seatArrangement?.columns || 10;
            
            console.log(`Menggunakan rows=${rows}, columns=${columns} sesuai dengan API`);
            
            // Buat array kursi dummy berdasarkan rows dan columns
            const dummySeats = [];
            const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, rows).split('');
            
            // Iterasi untuk setiap baris dan kolom
            for (let r = 0; r < rowLabels.length; r++) {
              for (let c = 1; c <= columns; c++) {
                const seatId = `${rowLabels[r]}${c}`;
                // Buat status acak sesuai dokumentasi API: 'available', 'reserved', atau 'selected'
                const statusOptions = ['available', 'reserved', 'selected'];
                const randomStatus = Math.random() < 0.8 ? 'available' : 
                                   Math.random() < 0.5 ? 'reserved' : 'selected';
                
                dummySeats.push({
                  id: seatId,
                  row: rowLabels[r],
                  column: c.toString(),
                  status: randomStatus,
                  price: 150000 - (r * 5000) // Variasi harga berdasarkan baris
                });
              }
            }
            
            // Jika eventData.seatArrangement tidak ada, buat objek baru
            if (!eventData.seatArrangement) {
              eventData.seatArrangement = {
                rows,
                columns,
                seats: dummySeats
              };
            } else {
              // Jika ada tapi seats array kosong, isi dengan data dummy
              eventData.seatArrangement.seats = dummySeats;
            }
            
            console.log(`Membuat ${dummySeats.length} kursi dummy untuk testing`);
          }
        } else {
          // Jika sudah ada data seats, pastikan formatnya sesuai dengan dokumentasi API
          console.log('Menggunakan data tempat duduk dari API');
          
          // Tambahkan ticketTypeId ke setiap kursi jika belum ada, berdasarkan kategori harga
          if (((eventData.tickets && eventData.tickets.length > 0) || 
               (eventData.ticketTypes && eventData.ticketTypes.length > 0)) && 
              eventData.seatArrangement && eventData.seatArrangement.seats) {
            
            // Gunakan ticket atau ticketTypes
            const ticketsData = eventData.tickets || eventData.ticketTypes;
            
            // Urutkan tiket dari termahal ke termurah
            const sortedTickets = [...ticketsData].sort((a, b) => {
              const priceA = typeof a.price === 'string' ? parseFloat(a.price) : (a.price || 0);
              const priceB = typeof b.price === 'string' ? parseFloat(b.price) : (b.price || 0);
              return priceB - priceA;
            });
            
            // Ambil harga untuk tiap kategori
            const ticketPrices: Record<string, number> = {
              'VVIP': sortedTickets.length > 0 ? 
                (typeof sortedTickets[0].price === 'string' ? parseFloat(sortedTickets[0].price) : (sortedTickets[0].price || 0)) : 0,
              'VIP': sortedTickets.length > 1 ? 
                (typeof sortedTickets[1].price === 'string' ? parseFloat(sortedTickets[1].price) : (sortedTickets[1].price || 0)) : 0,
              'Regular': sortedTickets.length > 2 ? 
                (typeof sortedTickets[2].price === 'string' ? parseFloat(sortedTickets[2].price) : (sortedTickets[2].price || 0)) : 0
            };
            
            // Ambil ID tiket untuk tiap kategori
            const ticketIds: Record<string, string> = {
              'VVIP': sortedTickets.length > 0 ? (sortedTickets[0]._id || sortedTickets[0].id) : '',
              'VIP': sortedTickets.length > 1 ? (sortedTickets[1]._id || sortedTickets[1].id) : '',
              'Regular': sortedTickets.length > 2 ? (sortedTickets[2]._id || sortedTickets[2].id) : ''
            };
            
            // Perbarui informasi kursi dengan ID tiket yang sesuai
            eventData.seatArrangement.seats = eventData.seatArrangement.seats.map((seat: {
              id?: string;
              row?: string;
              column?: string;
              status?: string;
              price?: number;
              ticketTypeId?: string;
            }) => {
              // Pastikan seat.id ada
              if (!seat.id) {
                seat.id = `unknown-${Math.random().toString(36).substring(2, 8)}`;
              }
              
              const rowChar = seat.row || seat.id.charAt(0);
              
              // Tentukan kategori berdasarkan baris
              let category: 'Regular' | 'VIP' | 'VVIP' = 'Regular';
              if (['F', 'G', 'H'].includes(rowChar)) {
                category = 'VIP';
              } else if (['I', 'J', 'K'].includes(rowChar)) {
                category = 'VVIP';
              }
              
              // Tetapkan harga dan ID tiket berdasarkan kategori jika belum ada
              if (!seat.ticketTypeId) {
                seat.ticketTypeId = ticketIds[category];
              }
              
              // Setel harga berdasarkan kategori jika belum ada
              if (!seat.price) {
                seat.price = ticketPrices[category];
              }
              
              return seat;
            });
          }
          
          // Validasi bahwa semua kursi memiliki format yang benar
          if (eventData.seatArrangement.seats.some((seat: any) => 
              !seat.id || 
              (seat.status !== 'available' && seat.status !== 'reserved' && seat.status !== 'selected'))) {
            console.log('Memformat ulang data kursi agar sesuai dengan dokumentasi API');
            
            // Perbaiki format data kursi jika diperlukan
            eventData.seatArrangement.seats = eventData.seatArrangement.seats.map((seat: any) => ({
              id: seat.id || `unknown-${Math.random().toString(36).substring(2, 8)}`,
              row: seat.row || seat.id?.charAt(0) || 'A',
              column: seat.column || seat.id?.substring(1) || '1',
              status: ['available', 'reserved', 'selected'].includes(seat.status) ? 
                      seat.status : 'available',
              price: seat.price || 0,
              ticketTypeId: seat.ticketTypeId
            }));
          }
        }
        
        // Normalize event data setelah penyesuaian
        return normalizeEvent(eventData);
      }
      
      throw new Error(response.data.message || 'Gagal mengambil detail acara');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Gagal mengambil detail acara');
      }
      throw error;
    }
  },

  // Fungsi untuk membuat event baru (hanya event organizer)
  async createEvent(eventData: Omit<Event, 'id' | '_id'>): Promise<Event> {
    try {
      const response = await api.post('/api/events', eventData);
      
      if (response.data.success) {
        return normalizeEvent(response.data.data);
      }
      
      throw new Error(response.data.message || 'Failed to create event');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to create event');
      }
      throw error;
    }
  },

  // Fungsi untuk membuat booking tiket
  async createBooking(eventId: string, bookingData: BookingParams): Promise<any> {
    try {
      const response = await api.post(`/api/orders`, {
        eventId: eventId,
        tickets: [{
          ticketType: bookingData.ticketTypeId,
          quantity: bookingData.quantity,
          seats: bookingData.seats.map(seat => {
            const [row, column] = seat.split('-');
            return { row: parseInt(row), column: parseInt(column) };
          })
        }],
        paymentInfo: {
          method: "credit_card",
          transactionId: `TRX-${Date.now()}`
        }
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to create booking');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to create booking');
      }
      throw error;
    }
  },

  // Fungsi untuk membuat kursi secara massal untuk event
  async createBulkSeats(eventId: string, seatData: {
    section: string;
    rows: string; // Format: "A-E"
    seatsPerRow: number;
    basePrice: number;
    ticketDistribution: Array<{
      ticketType: string;
      count: number;
    }>;
    seatNumbering?: 'alpha' | 'numeric';
    useTicketTypePrice?: boolean;
  }): Promise<any> {
    try {
      const response = await api.post('/api/seats/bulk', {
        event: eventId,
        section: seatData.section,
        rows: seatData.rows,
        seatsPerRow: seatData.seatsPerRow,
        basePrice: seatData.basePrice,
        ticketDistribution: seatData.ticketDistribution,
        seatNumbering: seatData.seatNumbering || 'numeric',
        useTicketTypePrice: seatData.useTicketTypePrice !== undefined ? seatData.useTicketTypePrice : true
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Gagal membuat kursi secara massal');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Gagal membuat kursi secara massal');
      }
      throw error;
    }
  }
}; 