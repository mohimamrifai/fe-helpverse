import { FaTicketAlt, FaTheaterMasks, FaRunning, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { eventService } from "../services/event";
import type { PromotionalOffer, Event } from "../services/event";
import { Link } from "react-router";

// Interface untuk eventOffers state
interface EventOffer {
    event: string;
    offer: PromotionalOffer;
    eventId: string; // Menambahkan eventId untuk link ke detail event
}

// Fungsi untuk mendapatkan ikon berdasarkan jenis diskon
const getIconByDiscountType = (discountType: string, discountValue: number) => {
    if (discountType === 'percentage') {
        return <FaTicketAlt className="text-secondary text-5xl" />;
    } else if (discountType === 'fixed') {
        return <FaTheaterMasks className="text-secondary text-5xl" />;
    } else {
        return <FaRunning className="text-secondary text-5xl" />;
    }
};

export function PromotionSection() {
    const [eventOffers, setEventOffers] = useState<EventOffer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [itemsToShow, setItemsToShow] = useState(3); // Default for desktop

    // Fetch promotional offers from API
    useEffect(() => {
        const fetchPromotionalOffers = async () => {
            try {
                setLoading(true);
                // Menggunakan eventService untuk mengambil data
                const response = await eventService.getAllEvents();
                const events = response.events || [];
                
                // Mengumpulkan semua promo aktif dari semua event
                const offers: EventOffer[] = [];
                
                events.forEach(event => {
                    if (event.promotionalOffers && event.promotionalOffers.length > 0) {
                        event.promotionalOffers
                            .filter(offer => offer.active)
                            .forEach(offer => {
                                offers.push({
                                    event: event.name,
                                    offer,
                                    eventId: event._id // Menyimpan ID event untuk link
                                });
                            });
                    }
                });
                
                console.log("Data promo yang ditemukan:", offers);
                setEventOffers(offers);
            } catch (err) {
                console.error("Error fetching promotional offers:", err);
                setError("Gagal memuat promo. Silakan coba lagi nanti.");
            } finally {
                setLoading(false);
            }
        };

        fetchPromotionalOffers();
    }, []);

    // Update items to show based on screen size
    useEffect(() => {
        const handleResize = () => {
            setItemsToShow(window.innerWidth < 768 ? 1 : 3);
        };
        
        // Set initial value
        handleResize();
        
        // Add event listener
        window.addEventListener('resize', handleResize);
        
        // Clean up
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const nextSlide = () => {
        if (currentIndex < eventOffers.length - itemsToShow) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0); // Loop back to first slide
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            setCurrentIndex(eventOffers.length - itemsToShow); // Loop to last slide
        }
    };

    // Auto scroll effect
    useEffect(() => {
        if (eventOffers.length <= itemsToShow) return; // Tidak perlu auto-scroll jika item sedikit
        
        const interval = setInterval(() => {
            nextSlide();
        }, 3000);
        return () => clearInterval(interval);
    }, [currentIndex, eventOffers.length, itemsToShow]);

    // Scroll to current index when it changes
    useEffect(() => {
        if (carouselRef.current) {
            const itemWidth = 250 + 16; // Card width (250px) + margin (2 * 8px)
            carouselRef.current.scrollTo({
                left: currentIndex * itemWidth,
                behavior: 'smooth'
            });
        }
    }, [currentIndex]);

    // Tampilkan loading state
    if (loading) {
        return (
            <div className="bg-secondary p-4 md:p-10">
                <h1 className="text-primary md:text-4xl text-2xl font-bold">Promo menarik untuk kamu</h1>
                <div className="flex justify-center items-center h-40">
                    <p className="text-primary">Memuat promo...</p>
                </div>
            </div>
        );
    }

    // Tampilkan error jika ada
    if (error) {
        return (
            <div className="bg-secondary p-4 md:p-10">
                <h1 className="text-primary md:text-4xl text-2xl font-bold">Promo menarik untuk kamu</h1>
                <div className="flex justify-center items-center h-40">
                    <p className="text-primary">{error}</p>
                </div>
            </div>
        );
    }

    // Tampilkan pesan jika tidak ada promo
    if (eventOffers.length === 0) {
        return (
            <div className="bg-secondary p-4 md:p-10">
                <h1 className="text-primary md:text-4xl text-2xl font-bold">Promo menarik untuk kamu</h1>
                <div className="flex justify-center items-center h-40">
                    <p className="text-primary">Belum ada promo tersedia saat ini.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-secondary p-4 md:p-10 relative">
            <h1 className="text-primary md:text-4xl text-2xl font-bold">Promo menarik untuk kamu</h1>

            <div className="relative mt-6">
                {/* Navigation buttons - hanya tampilkan jika ada lebih dari itemsToShow promo */}
                {eventOffers.length > itemsToShow && (
                    <>
                        <button 
                            onClick={prevSlide}
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-primary text-secondary rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                            aria-label="Previous slide"
                        >
                            <FaChevronLeft />
                        </button>
                        
                        <button 
                            onClick={nextSlide}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-primary text-secondary rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                            aria-label="Next slide"
                        >
                            <FaChevronRight />
                        </button>
                    </>
                )}
                
                <div 
                    ref={carouselRef}
                    className="flex overflow-hidden mt-4 scroll-smooth"
                >
                    {eventOffers.map((item, index) => {
                        const { event, offer, eventId } = item;
                        const icon = getIconByDiscountType(offer.discountType, offer.discountValue);
                        
                        // Format title berdasarkan jenis diskon
                        let title = "";
                        if (offer.discountType === 'percentage') {
                            title = `${offer.discountValue}% Discount`;
                        } else if (offer.discountType === 'fixed') {
                            title = `RM${offer.discountValue} Off`;
                        } else {
                            title = offer.code;
                        }
                        
                        // Format tanggal untuk menampilkan validitas promo
                        const validFrom = new Date(offer.validFrom).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'});
                        const validUntil = new Date(offer.validUntil).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'});
                        
                        return (
                            <Link 
                                key={index} 
                                to={`/event/${eventId}`}
                                className="md:w-[250px] w-[250px] flex-shrink-0 mx-2 transition-all duration-300"
                            >
                                <div className="bg-primary p-4 md:p-6 rounded-md shadow-md hover:shadow-lg transition-all duration-300 h-full">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-3">
                                        <div className="flex justify-center md:justify-start">
                                            {icon}
                                        </div>
                                        <div className="text-center md:text-left">
                                            <h2 className="text-secondary md:text-2xl text-xl font-bold">{title}</h2>
                                            {/* <span className="inline-block bg-secondary text-primary text-xs px-2 py-1 rounded mt-1">{event}</span> */}
                                        </div>
                                    </div>
                                    {/* Deskripsi ditambahkan secara manual karena tidak ada dalam PromotionalOffer dari API */}
                                    <p className="text-secondary md:text-sm text-xs mt-2 text-center md:text-left">
                                        {offer.discountType === 'percentage' 
                                            ? `Hemat ${offer.discountValue}% untuk event ${event}`
                                            : `Hemat RM${offer.discountValue} untuk event ${event}`
                                        }
                                    </p>
                                    <div className="mt-4 pt-3 border-t border-secondary/30 text-center md:text-left">
                                        <p className="text-secondary text-xs font-semibold">Kode: <span className="bg-secondary/20 px-2 py-1 rounded">{offer.code}</span></p>
                                        <p className="text-secondary text-xs mt-1">Berlaku: {validFrom} - {validUntil}</p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
                
                {/* Indicator dots - hanya tampilkan jika ada lebih dari itemsToShow promo */}
                {eventOffers.length > itemsToShow && (
                    <div className="flex justify-center mt-4">
                        {Array.from({ length: eventOffers.length - itemsToShow + 1 }).map((_, index) => (
                            <button 
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 md:w-3 md:h-3 mx-1 rounded-full ${currentIndex === index ? 'bg-primary' : 'bg-gray-300'}`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
