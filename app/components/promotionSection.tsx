import { FaTicketAlt, FaTheaterMasks, FaRunning, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";

const promotionData = [
    {
        title: "50% Discount",
        category: "Music Festival",
        description: "Get 50% off on all tickets for the Music Festival",
        promoCode: "MUSICFEST2025",
        icon: <FaTicketAlt className="text-secondary text-5xl" />
    },
    {
        title: "Buy 1 Get 1 Free",
        category: "Theater Show",
        description: "Purchase one ticket and get another one for free",
        promoCode: "THEATER2FOR1",
        icon: <FaTheaterMasks className="text-secondary text-5xl" />
    },
    {
        title: "Early Bird 30% Off",
        category: "Sports Event",
        description: "Book early and save 30% on premium seats",
        promoCode: "EARLYBIRD30",
        icon: <FaRunning className="text-secondary text-5xl" />
    },
    {
        title: "Family Package",
        category: "Theme Park",
        description: "Special discount for family of 4 or more",
        promoCode: "FAMILYFUN",
        icon: <FaTicketAlt className="text-secondary text-5xl" />
    },
    {
        title: "Student Discount",
        category: "Educational Event",
        description: "20% off for students with valid ID",
        promoCode: "STUDENT20",
        icon: <FaTheaterMasks className="text-secondary text-5xl" />
    },
    {
        title: "Weekend Special",
        category: "Concert",
        description: "15% discount on weekend concert tickets",
        promoCode: "WEEKEND15",
        icon: <FaRunning className="text-secondary text-5xl" />
    },
    {
        title: "Group Booking",
        category: "Conference",
        description: "25% off when booking for groups of 10+",
        promoCode: "GROUP25",
        icon: <FaTicketAlt className="text-secondary text-5xl" />
    },
    {
        title: "VIP Experience",
        category: "Exhibition",
        description: "Upgrade to VIP access at regular price",
        promoCode: "VIPUPGRADE",
        icon: <FaTheaterMasks className="text-secondary text-5xl" />
    }
]

export function PromotionSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [itemsToShow, setItemsToShow] = useState(3); // Default for desktop

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
        if (currentIndex < promotionData.length - itemsToShow) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0); // Loop back to first slide
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            setCurrentIndex(promotionData.length - itemsToShow); // Loop to last slide
        }
    };

    // Auto scroll effect
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 3000);
        return () => clearInterval(interval);
    }, [currentIndex]);

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

    return (
        <div className="bg-secondary p-4 md:p-10 relative">
            <h1 className="text-primary md:text-4xl text-2xl font-bold">Promo menarik untuk kamu</h1>

            <div className="relative mt-6">
                {/* Navigation buttons */}
                <button 
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-primary text-secondary rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                    aria-label="Previous slide"
                >
                    <FaChevronLeft />
                </button>
                
                <div 
                    ref={carouselRef}
                    className="flex overflow-hidden mt-4 scroll-smooth"
                >
                    {promotionData.map((promo, index) => (
                        <div 
                            key={index} 
                            className="md:w-[250px] w-[250px] flex-shrink-0 mx-2 transition-all duration-300"
                        >
                            <div className="bg-primary p-4 md:p-6 rounded-md shadow-md hover:shadow-lg transition-all duration-300 h-full">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-3">
                                    <div className="flex justify-center md:justify-start">
                                        {promo.icon}
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h2 className="text-secondary md:text-2xl text-xl font-bold">{promo.title}</h2>
                                        <span className="inline-block bg-secondary text-primary text-xs px-2 py-1 rounded mt-1">{promo.category}</span>
                                    </div>
                                </div>
                                <p className="text-secondary md:text-sm text-xs mt-2 text-center md:text-left">{promo.description}</p>
                                <div className="mt-4 pt-3 border-t border-secondary/30 text-center md:text-left">
                                    <p className="text-secondary text-xs font-semibold">Use code: <span className="bg-secondary/20 px-2 py-1 rounded">{promo.promoCode}</span></p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <button 
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-primary text-secondary rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                    aria-label="Next slide"
                >
                    <FaChevronRight />
                </button>
                
                {/* Indicator dots */}
                <div className="flex justify-center mt-4">
                    {Array.from({ length: promotionData.length - itemsToShow + 1 }).map((_, index) => (
                        <button 
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 md:w-3 md:h-3 mx-1 rounded-full ${currentIndex === index ? 'bg-primary' : 'bg-gray-300'}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
