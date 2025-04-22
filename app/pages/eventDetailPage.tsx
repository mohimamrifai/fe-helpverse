import React from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaMoneyBillWave, FaTicketAlt, FaUser, FaInfoCircle, FaTag } from 'react-icons/fa';
import { Link, useParams } from 'react-router';
import { useEventDetail } from '../hooks/useEvent';

// Definisi tipe lokal jika impor dari services/event bermasalah
interface TicketType {
  _id: string;
  id: string;
  name?: string;
  description?: string;
  price?: string;
  category?: string;
  available?: number;
  total?: number;
  maxPerOrder?: number;
  limit?: string;
  rows?: number;
  columns?: number;
  buffer?: {
    type: string;
    data: number[];
  };
}

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

export default function EventDetailPage() {
    const { id } = useParams();
    const { event, loading, error } = useEventDetail(id);

    if (loading) {
        return (
            <div className="py-6 md:py-28 px-4 md:px-8 lg:px-16">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="py-6 md:py-28 px-4 md:px-8 lg:px-16">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error || 'Event tidak ditemukan'}</span>
                </div>
            </div>
        );
    }

    // Menambahkan URL default jika image tidak lengkap
    const getImageUrl = (image: string) => {
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

    // Fungsi untuk menampilkan harga tiket
    const renderTicketPrices = () => {
        if (!event.ticketTypes || event.ticketTypes.length === 0) {
            return <span>Tiket tidak tersedia</span>;
        }

        // Menggunakan data sesuai dengan API
        return event.ticketTypes.map((ticket, index) => {
            // Ambil harga dan nama dari tiket, gunakan default jika tidak tersedia
            const ticketName = ticket.name || `Tiket ${index + 1}`;
            const ticketPrice = ticket.price || "150000";
            
            return (
                <span key={ticket._id || index} className="bg-secondary/20 px-2 py-0.5 rounded-full text-xs">
                    {ticketName} - RM {ticketPrice}
                </span>
            );
        });
    };

    // Menentukan harga tiket terendah
    const getStartingPrice = () => {
        if (!event.ticketTypes || event.ticketTypes.length === 0) {
            return 150000; // Default jika tiket tidak tersedia
        }
        
        // Mencari harga tiket terendah
        let lowestPrice = Number.MAX_VALUE;
        event.ticketTypes.forEach(ticket => {
            if (ticket.price) {
                const price = parseFloat(ticket.price);
                if (price < lowestPrice) {
                    lowestPrice = price;
                }
            }
        });
        
        return lowestPrice === Number.MAX_VALUE ? 150000 : lowestPrice;
    };

    const startingPrice = getStartingPrice();

    return (
        <div className="py-28 md:py-28 px-4 md:px-8 lg:px-16">
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center items-start">
                <div className="flex justify-center">
                    <img src={getImageUrl(event.image)} alt={event.title} className="w-[250px] h-[400px] object-cover rounded-lg shadow-md" />
                </div>
                <div className="bg-primary rounded-lg shadow-md p-4 text-secondary flex flex-col gap-3 md:w-1/3 max-w-md">
                    <h1 className="text-xl md:text-2xl font-bold">{event.title}</h1>
                    <p className="text-sm">{event.description}</p>
                    
                    <div className="mt-4 space-y-3">
                        <div className="flex items-start gap-3 text-sm min-h-[40px]">
                            <FaCalendarAlt className="text-secondary/80 mt-1 w-4 h-4 flex-shrink-0" />
                            <div>
                                <span className="font-semibold block">Tanggal:</span>
                                <span>{formatDate(event.date)}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-3 text-sm min-h-[40px]">
                            <FaClock className="text-secondary/80 mt-1 w-4 h-4 flex-shrink-0" />
                            <div>
                                <span className="font-semibold block">Waktu:</span>
                                <span>{event.time}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-3 text-sm min-h-[40px]">
                            <FaMapMarkerAlt className="text-secondary/80 mt-1 w-4 h-4 flex-shrink-0" />
                            <div>
                                <span className="font-semibold block">Lokasi:</span>
                                <span>{event.venue}</span>
                                {event.address && (
                                    <span className="block text-secondary/80 mt-1">{event.address}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-1">
                        <div className="flex items-center gap-2 mb-1.5 text-sm">
                            <FaMoneyBillWave className="text-secondary/80" />
                            <span className="font-semibold">Mulai dari:</span>RM {startingPrice}
                        </div>
                        <div className="flex items-center gap-2 mb-1.5 text-sm">
                            <FaTicketAlt className="text-secondary/80" />
                            <span className="font-semibold">Tersedia:</span> {event.availableSeats}/{event.totalSeats} kursi
                        </div>
                        {event.category && (
                            <div className="flex items-center gap-2 mb-1.5 text-sm">
                                <FaTag className="text-secondary/80" />
                                <span className="font-semibold">Kategori:</span> {event.category}
                            </div>
                        )}
                    </div>
                    
                    {event.promotionalOffers && event.promotionalOffers.length > 0 && (
                        <div className="bg-yellow-100 p-2 rounded-md my-1">
                            <div className="flex items-start gap-2 text-yellow-800 text-sm">
                                <FaInfoCircle className="mt-0.5" />
                                <div>
                                    <p className="font-bold">Promo Tersedia!</p>
                                    {event.promotionalOffers.map(promo => (
                                        <p key={promo._id}>
                                            Gunakan kode <span className="font-mono font-semibold">{promo.code}</span> untuk 
                                            {promo.discountType === 'percentage' ? 
                                                ` diskon ${promo.discountValue}%` : 
                                                ` potongan RM ${promo.discountValue}`}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {renderTicketPrices()}
                    </div>
                    
                    <Link to={`/event/${event.id}/book`} className="mt-3 text-center bg-secondary text-primary py-2 px-4 rounded-md font-bold hover:bg-secondary/90 transition-colors text-sm">
                        Pesan Tiket
                    </Link>
                </div>
            </div>
        </div>
    );
}
