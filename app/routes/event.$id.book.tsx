import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Navbar } from '~/components/navbar';
import { Footer } from '~/components/footer';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaMoneyBillWave, FaSpinner } from 'react-icons/fa';
import { eventService } from '~/services/event';

// Tipe untuk tiket
interface TicketType {
  _id: string;
  id: string;
  name?: string;
  description?: string;
  price?: string;
  formattedPrice?: string;
  category?: string;
  available?: number;
  total?: number;
  maxPerOrder?: number;
  limit?: string;
  rows?: number;
  columns?: number;
  seats?: {
    id: string;
    row: string;
    column: string;
    status: string;
    price: number;
  }[];
}

// Tipe untuk event
interface Event {
  id: string;
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  category: string;
  image: string;
  totalSeats: number;
  availableSeats: number;
  published: boolean;
  approvalStatus?: string;
  approvalNotes?: string;
  ticketTypes: TicketType[];
  organizer: {
    _id: string;
    name: string;
    email: string;
  };
  seatArrangement?: {
    rows?: number;
    columns?: number;
    seats: {
      id: string;
      row?: string;
      column?: string;
      status: 'available' | 'reserved' | 'selected';
      price: number;
    }[];
  };
  promotionalOffers?: {
    _id?: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxUses: number;
    currentUses: number;
    validFrom: string;
    validUntil: string;
    active: boolean;
  }[];
}

// Tipe untuk informasi kursi
interface SeatInfo {
  id: string;
  status: 'available' | 'reserved' | 'booked' | 'selected';
  price: number;
  row?: string;
  column?: string;
}

// Seat status types untuk tampilan UI
type SeatStatus = 'available' | 'selected' | 'sold';

export function meta() {
    return [
        { title: "Pesan Tiket - HELPVerse" },
        { name: "description", content: "Pesan tiket untuk event ini" },
    ];
}

export default function EventBookingPage() {
    const { id } = useParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);
    
    // Fungsi untuk memformat mata uang Ringgit Malaysia
    const formatRinggit = (amount: number | string) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        // Konversi dari Rupiah ke Ringgit Malaysia dengan nilai yang benar
        // Tidak perlu dibagi 3500 jika data sudah dalam format Ringgit
        return `RM ${numAmount.toFixed(2)}`;
    };

    // Fungsi untuk memuat data event
    useEffect(() => {
        const fetchEventDetail = async () => {
            try {
                setLoading(true);
                if (!id) {
                    setError('ID acara diperlukan');
                    return;
                }
                
                console.log(`Mengambil data detail acara dengan ID: ${id}`);
                
                // Ambil data event dari API
                const eventData = await eventService.getEventById(id);
                console.log('Data acara yang diterima:', eventData);
                
                // Pastikan data ticketTypes lengkap
                if (eventData && eventData.ticketTypes && eventData.ticketTypes.length > 0) {
                    console.log(`Ditemukan ${eventData.ticketTypes.length} tipe tiket:`, 
                        eventData.ticketTypes.map(t => `${t.name} (${t.price})`).join(', '));
                    
                    // Log informasi pengaturan tempat duduk jika ada
                    if (eventData.seatArrangement && eventData.seatArrangement.seats) {
                        console.log(`Pengaturan tempat duduk: ${eventData.seatArrangement.rows} baris, ${eventData.seatArrangement.columns} kolom, ${eventData.seatArrangement.seats.length} kursi`);
                        
                        // Hitung jumlah kursi per kategori berdasarkan tipe tiket
                        const seatsByCategory: Record<string, number> = {};
                        
                        // Inisialisasi counter untuk setiap tipe tiket
                        if (eventData.ticketTypes && eventData.ticketTypes.length > 0) {
                            eventData.ticketTypes.forEach(ticket => {
                                if (ticket.name) {
                                    seatsByCategory[ticket.name] = 0;
                                }
                            });
                        } else {
                            // Fallback jika tidak ada tipe tiket
                            seatsByCategory['Default'] = 0;
                        }
                        
                        eventData.seatArrangement.seats.forEach(seat => {
                            if (!seat.id) return;
                            
                            const rowChar = seat.row || seat.id.charAt(0);
                            
                            // Tentukan kategori berdasarkan harga dan tipe tiket
                            let foundTicket = eventData.ticketTypes.find(
                                t => parseFloat(t.price?.toString() || '0') === seat.price
                            );
                            
                            let category = foundTicket?.name || 'Default';
                            
                            // Pastikan kategori ada dalam seatsByCategory
                            if (!seatsByCategory[category]) {
                                seatsByCategory[category] = 0;
                            }
                            
                            seatsByCategory[category]++;
                        });
                        
                        console.log('Jumlah kursi per kategori:', seatsByCategory);
                    }
                }
                
                setEvent(eventData as Event);
            } catch (err) {
                console.error('Error fetching event details:', err);
                setError('Gagal memuat detail acara. Silakan coba lagi nanti.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchEventDetail();
    }, [id]);
    
    // Menangani klik kursi
    const handleSeatClick = (seatId: string) => {
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(seat => seat !== seatId));
        } else {
            // Batasi jumlah kursi berdasarkan maxPerOrder jika ada
            const maxSeats = event?.ticketTypes[0]?.maxPerOrder || 10;
            if (selectedSeats.length < maxSeats) {
                setSelectedSeats([...selectedSeats, seatId]);
            } else {
                // Bisa ditambahkan notifikasi bahwa melebihi batas maksimal
                alert(`Maksimal pemesanan adalah ${maxSeats} kursi`);
            }
        }
    };
    
    // Menghapus semua kursi yang telah dipilih
    const handleRemoveSelection = () => {
        setSelectedSeats([]);
    };
    
    // Menghitung total harga berdasarkan kursi yang dipilih
    useEffect(() => {
        if (!event || !event.seatArrangement || !event.seatArrangement.seats) return;
        
        // Hitung total berdasarkan harga kursi yang dipilih
        let total = 0;
        
        // Cari harga untuk setiap kursi yang dipilih
        selectedSeats.forEach(seatId => {
            const seat = event.seatArrangement?.seats.find(s => s.id === seatId);
            if (seat) {
                total += seat.price;
            }
        });
        
        setTotalPrice(total);
    }, [selectedSeats, event]);
    
    // Menentukan status kursi
    const getSeatStatus = (seatId: string): SeatStatus => {
        if (selectedSeats.includes(seatId)) return 'selected';
        
        // Cari kursi di seatArrangement API
        const seat = event?.seatArrangement?.seats?.find(seat => seat.id === seatId);
        
        // Jika kursi ditemukan dan statusnya 'reserved' atau 'booked', maka kursi sudah terjual/terpesan
        if (seat) {
            const seatStatus = seat.status as string;
            if (seatStatus === 'reserved' || seatStatus === 'booked') {
                return 'sold';
            }
        }
        
        return 'available';
    };
    
    // Render satu kursi
    const renderSeat = (seat: SeatInfo | { id: string; status: string; price: number; row?: string; column?: string; }, seatNumber?: number) => {
        const status = getSeatStatus(seat.id);
        const displayNumber = seatNumber || seat.id;
        
        return (
            <div 
                key={seat.id}
                onClick={() => status !== 'sold' ? handleSeatClick(seat.id) : null}
                className={`w-6 h-6 rounded-sm text-[10px] flex items-center justify-center cursor-pointer mx-0.5 ${
                    status === 'available' ? 'bg-gray-300 hover:bg-gray-400' : 
                    status === 'selected' ? 'bg-blue-500 text-white' : 
                    'bg-red-700 text-white cursor-not-allowed'
                }`}
                title={`Kursi ${seat.id} - ${formatRinggit(seat.price)}`}
            >
                {displayNumber}
            </div>
        );
    };
    
    // Render satu baris kursi
    const renderRow = (rowLabel: string, seatCount: number = 25) => {
        const seats = Array.from({ length: seatCount }).map((_, seatIndex) => {
            const seatId = `${rowLabel}${seatIndex + 1}`;
            // Buat objek kursi untuk digunakan dengan fungsi renderSeat
            const seat = {
                id: seatId,
                status: 'available',
                price: event?.ticketTypes?.[0]?.price ? parseFloat(event.ticketTypes[0].price) : 0,
                row: rowLabel,
                column: (seatIndex + 1).toString()
            };
            return renderSeat(seat, seatIndex + 1);
        });

        return (
            <div className="flex items-center justify-center my-1.5" key={rowLabel}>
                <div className="w-6 h-6 flex items-center justify-center text-[10px] font-bold">
                    {rowLabel}
                </div>
                <div className="flex flex-wrap justify-center">
                    {seats}
                </div>
                <div className="w-6 h-6 flex items-center justify-center text-[10px] font-bold">
                    {rowLabel}
                </div>
            </div>
        );
    };
    
    // Kelompokkan dan urutkan semua kursi berdasarkan harga
    const renderAllSeats = () => {
        if (!event?.seatArrangement?.seats || event.seatArrangement.seats.length === 0) {
            return (
                <div className="text-center p-4 bg-yellow-100 rounded-lg">
                    <p>Tidak ada kursi tersedia untuk acara ini.</p>
                </div>
            );
        }

        // Kelompokkan kursi berdasarkan harga
        const seatsByPrice: Record<number, SeatInfo[]> = {};
        
        // Hanya tampilkan kursi yang available
        const availableSeats = event.seatArrangement.seats.filter(seat => seat.status === 'available');
        
        // Kelompokkan berdasarkan harga
        availableSeats.forEach(seat => {
            if (!seatsByPrice[seat.price]) {
                seatsByPrice[seat.price] = [];
            }
            seatsByPrice[seat.price].push(seat);
        });

        // Dapatkan harga-harga yang tersedia, dan urutkan dari tertinggi ke terendah
        const prices = Object.keys(seatsByPrice).map(Number).sort((a, b) => b - a);

        if (prices.length === 0) {
            return (
                <div className="text-center p-4 bg-yellow-100 rounded-lg">
                    <p>Tidak ada kursi tersedia untuk acara ini.</p>
                </div>
            );
        }

        // Temukan tipe tiket berdasarkan harga
        const findTicketByPrice = (price: number) => {
            return event.ticketTypes?.find(t => parseFloat(t.price?.toString() || '0') === price);
        };

        return (
            <div className="flex flex-col items-center w-full">
                {/* Render kursi untuk setiap kelompok harga */}
                {prices.map(price => {
                    const seats = seatsByPrice[price];
                    const ticket = findTicketByPrice(price);
                    
                    // Kelompokkan berdasarkan baris
                    const seatsByRow: Record<string, SeatInfo[]> = {};
                    seats.forEach(seat => {
                        const rowChar = seat.row || seat.id.charAt(0);
                        if (!seatsByRow[rowChar]) {
                            seatsByRow[rowChar] = [];
                        }
                        seatsByRow[rowChar].push(seat);
                    });
                    
                    // Urutkan baris
                    const rowLabels = Object.keys(seatsByRow).sort();
                    
                    // Tentukan warna header berdasarkan harga relatif
                    let headerClass = 'bg-primary';
                    
                    // Tentukan warna berdasarkan posisi harga dalam daftar (tertinggi, tengah, terendah)
                    if (price === prices[0]) {
                        headerClass = 'bg-purple-600'; // Tiket paling mahal
                    } else if (prices.length > 2 && price === prices[Math.floor(prices.length / 2)]) {
                        headerClass = 'bg-indigo-600'; // Tiket harga menengah
                    } else if (price === prices[prices.length - 1]) {
                        headerClass = 'bg-gray-600'; // Tiket paling murah
                    }

                    // Format harga tiket
                    const formattedPrice = ticket && 'formattedPrice' in ticket && ticket.formattedPrice
                        ? ticket.formattedPrice
                        : formatRinggit(price);
                    
                    return (
                        <div key={`price-${price}`} className="w-full mb-8">
                            <div className={`text-center py-2 mb-4 ${headerClass} text-white font-medium w-full rounded-sm`}>
                                <span>{ticket?.name || `Tiket ${formattedPrice}`}</span>
                            </div>
                            
                            {rowLabels.map(rowLabel => {
                                const rowSeats = seatsByRow[rowLabel];
                                
                                // Urutkan kursi berdasarkan nomor
                                rowSeats.sort((a, b) => {
                                    const numA = parseInt(a.id.substring(1));
                                    const numB = parseInt(b.id.substring(1));
                                    return numA - numB;
                                });
                                
                                return (
                                    <div className="flex items-center justify-center my-1.5" key={`${price}-${rowLabel}`}>
                                        <div className="w-6 h-6 flex items-center justify-center text-[10px] font-bold">
                                            {rowLabel}
                                        </div>
                                        <div className="flex flex-wrap justify-center">
                                            {rowSeats.map(seat => {
                                                const seatNumber = parseInt(seat.id.substring(1));
                                                return renderSeat(seat, seatNumber);
                                            })}
                                        </div>
                                        <div className="w-6 h-6 flex items-center justify-center text-[10px] font-bold">
                                            {rowLabel}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    };
    
    // Menambahkan URL default jika image tidak lengkap
    const getImageUrl = (image: string) => {
        if (!image) return '/default-event.jpg';
        if (image.startsWith('http')) return image;
        return `/${image}`;
    };
    
    // Format tanggal ke format yang lebih mudah dibaca
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        } catch (e) {
            return dateString;
        }
    };
    
    // Tampilan loading
    if (loading) {
        return (
            <main>
                <Navbar />
                <div className="py-48 px-4 max-w-6xl mx-auto flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <FaSpinner className="animate-spin text-primary text-4xl mb-4" />
                        <p>Memuat informasi acara...</p>
                    </div>
            </div>
                <Footer />
            </main>
        );
    }
    
    // Tampilan error
    if (error || !event) {
        return (
            <main>
                <Navbar />
                <div className="py-6 md:py-28 px-4 max-w-6xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error || 'Acara tidak ditemukan'}</span>
                        <Link to="/" className="block mt-2 text-red-800 font-semibold hover:underline">
                            Kembali ke Halaman Utama
                        </Link>
                    </div>
            </div>
                <Footer />
            </main>
        );
    }

    return (
        <main>
            <Navbar />
            <div className="py-28 px-4 max-w-6xl mx-auto">
                <div className="flex items-center mb-4 md:mb-8">
                    <Link to={`/event/${id}`} className="text-primary font-medium flex items-center text-sm md:text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Kembali ke Detail Acara
                    </Link>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Seat map */}
                    <div className="bg-gray-200 rounded-lg p-2 md:p-4 flex-grow overflow-x-auto">
                        <div className="flex justify-between items-center mb-2 md:mb-4">
                            <div className="flex space-x-2 md:space-x-4">
                                <div className="flex items-center space-x-1 md:space-x-2">
                                    <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-300 rounded-sm"></div>
                                    <span className="text-xs md:text-sm">Tersedia</span>
                                </div>
                                <div className="flex items-center space-x-1 md:space-x-2">
                                    <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-sm"></div>
                                    <span className="text-xs md:text-sm">Dipilih</span>
                                </div>
                                <div className="flex items-center space-x-1 md:space-x-2">
                                    <div className="w-3 h-3 md:w-4 md:h-4 bg-red-700 rounded-sm"></div>
                                    <span className="text-xs md:text-sm">Terjual</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* STAGE area */}
                        <div className="bg-gray-300 text-center py-1 md:py-2 mb-2 md:mb-4 text-gray-700 font-medium max-w-2xl mx-auto text-sm md:text-base">
                            PANGGUNG
                        </div>
                        
                        {/* Main seating area */}
                        <div className="flex justify-center">
                            <div className="flex flex-col items-center overflow-x-auto pb-4">
                                {renderAllSeats()}
                            </div>
                        </div>
                    </div>
                    
                    {/* Event details and seat selection */}
                    <div className="bg-primary text-white rounded-lg p-4 md:p-6 md:w-80 h-fit">
                        <div className="flex mb-4 gap-4">
                            <img 
                                src={getImageUrl(event.image)} 
                                alt={event.title} 
                                className="w-20 h-24 object-cover rounded flex-shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                                <h2 className="text-base md:text-xl font-bold truncate">{event.title}</h2>
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-start gap-2">
                                        <FaMapMarkerAlt className="w-4 h-4 opacity-80 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm line-clamp-2">{event.venue}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaCalendarAlt className="w-4 h-4 opacity-80 flex-shrink-0" />
                                        <span className="text-sm">{formatDate(event.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaClock className="w-4 h-4 opacity-80 flex-shrink-0" />
                                        <span className="text-sm">{event.time}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-4 md:mt-6">
                            <h3 className="text-sm md:text-lg mb-1 md:mb-2">Nomor Kursi</h3>
                            <p className="text-gray-300 text-xs md:text-sm">
                                {selectedSeats.length > 0 
                                    ? selectedSeats.join(', ') 
                                    : 'Belum ada kursi dipilih'}
                            </p>
                            <p className="text-xs mt-1">
                                {selectedSeats.length} kursi dipilih
                            </p>
                        </div>
                        
                        <div className="mt-4 border-t border-white border-opacity-20 pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Harga Tiket ({selectedSeats.length}x):</span>
                                <span className="font-medium">{formatRinggit(totalPrice)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center mt-2 text-lg font-bold">
                                <span>Total:</span>
                                <span>{formatRinggit(totalPrice)}</span>
                            </div>
                        </div>
                        
                        <div className="mt-6 md:mt-8">
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={handleRemoveSelection}
                                    className="bg-red-500 p-1 rounded-sm text-white cursor-pointer"
                                    disabled={selectedSeats.length === 0}
                                >
                                    Hapus Pilihan
                                </button>
                                
                                <Link 
                                    to={selectedSeats.length > 0 ? `/event/${id}/payment` : '#'}
                                    className={`bg-yellow-400 p-1 rounded-sm text-white cursor-pointer text-center ${
                                        selectedSeats.length === 0 ? 'opacity-80 cursor-not-allowed' : 'hover:translate-y-[-2px]'
                                    }`}
                                    onClick={(e) => {
                                        if (selectedSeats.length === 0) {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    Lanjut Bayar
                                </Link>

                                <Link 
                                    to={'#'}
                                    className="bg-blue-400 p-1 rounded-sm text-white cursor-pointer text-center"
                                >
                                    Join Waitlist
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
} 