import * as React from 'react';
import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { Navbar } from '~/components/navbar';
import { Footer } from '~/components/footer';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

// Mock event data (should be fetched from your backend)
const eventData = {
    id: 1,
    image: "/event-1.png",
    title: "Music Festival 2025",
    date: "August,10 2025",
    time: "10AM",
    location: "HELP Auditorium",
};

// Mock selected seats (should be passed from booking page)
const selectedSeats = ['A1', 'A2', 'A3'];

export function meta() {
    return [
        { title: "Payment - Helpverse" },
        { name: "description", content: "Complete your payment for the event" },
    ];
}

export default function EventPaymentPage(): React.ReactElement {
    const { id } = useParams();
    const [paymentMethod, setPaymentMethod] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    const handlePayClick = () => {
        setShowModal(true);
        // Auto hide modal after 3 seconds
        setTimeout(() => {
            setShowModal(false);
        }, 3000);
    };

    return (
        <main className="bg-gray-50 min-h-screen">
            <Navbar />
            {/* Modal Dialog */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Feature</h3>
                            <p className="text-sm text-gray-500">
                                This feature is currently under development. Thank you for your patience!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 py-16 md:py-28">
                <div className="mb-6">
                    <Link to={`/event/${id}`} className="text-indigo-800 font-medium flex items-center">
                        ← Confirmation your order
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Payment Methods */}
                    <div className="md:w-2/3">
                        <div className="space-y-6">
                            {/* Virtual Account Section */}
                            <div>
                                <h3 className="text-lg font-medium mb-4">Virtual Account</h3>
                                <button
                                    onClick={() => setPaymentMethod('mandiri')}
                                    className={`w-full p-4 border rounded-lg text-left ${
                                        paymentMethod === 'mandiri' ? 'border-indigo-500' : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={paymentMethod === 'mandiri'}
                                            onChange={() => setPaymentMethod('mandiri')}
                                            className="mr-3"
                                        />
                                        <span>Mandiri Virtual Account</span>
                                    </div>
                                </button>
                            </div>

                            {/* E-Wallet Section */}
                            <div>
                                <h3 className="text-lg font-medium mb-4">E-Wallet</h3>
                                <button
                                    onClick={() => setPaymentMethod('shopee')}
                                    className={`w-full p-4 border rounded-lg text-left ${
                                        paymentMethod === 'shopee' ? 'border-indigo-500' : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={paymentMethod === 'shopee'}
                                            onChange={() => setPaymentMethod('shopee')}
                                            className="mr-3"
                                        />
                                        <span>Shopee pay</span>
                                    </div>
                                </button>
                            </div>

                            {/* Card Section */}
                            <div>
                                <h3 className="text-lg font-medium mb-4">Card</h3>
                                <button
                                    onClick={() => setPaymentMethod('credit')}
                                    className={`w-full p-4 border rounded-lg text-left ${
                                        paymentMethod === 'credit' ? 'border-indigo-500' : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={paymentMethod === 'credit'}
                                            onChange={() => setPaymentMethod('credit')}
                                            className="mr-3"
                                        />
                                        <span>Credit Card</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="md:w-1/3">
                        <div className="bg-indigo-900 text-white rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-6">Order details</h2>
                            
                            <div className="flex items-start mb-6">
                                <img 
                                    src={eventData.image}
                                    alt={eventData.title}
                                    className="w-20 h-28 object-cover rounded"
                                />
                                <div className="ml-4">
                                    <h3 className="font-semibold">{eventData.title}</h3>
                                    <div className="text-sm opacity-80 mt-1">
                                        <div className="flex items-center">
                                            <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                                            {eventData.location}
                                        </div>
                                        <div className="flex items-center">
                                            <FaCalendarAlt className="w-4 h-4 mr-2" />
                                            {eventData.date}
                                        </div>
                                        <div className="flex items-center">
                                            <FaClock className="w-4 h-4 mr-2" />
                                            {eventData.time}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-indigo-800 py-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span>VIP Tickets</span>
                                        <div className="text-sm opacity-80 mt-1">
                                            Seat: {selectedSeats.join(', ')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div>{selectedSeats.length} × RM40</div>
                                        <div>RM{selectedSeats.length * 40}</div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-center justify-between">
                                        <input
                                            type="text"
                                            placeholder="Promotional Code"
                                            className="bg-transparent border border-indigo-700 rounded px-3 py-1 text-sm w-2/3"
                                        />
                                        <button className="bg-white text-indigo-900 px-4 py-1 rounded text-sm">
                                            apply
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-indigo-800 pt-4">
                                    <div className="flex justify-between mb-2">
                                        <span>Subtotal</span>
                                        <span>RM{selectedSeats.length * 40}</span>
                                    </div>
                                    <div className="flex justify-between mb-4">
                                        <span>Discount</span>
                                        <span>RM0</span>
                                    </div>
                                    <div className="flex justify-between font-semibold">
                                        <span>Total</span>
                                        <span>RM{selectedSeats.length * 40}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePayClick}
                                    className="w-full bg-white text-indigo-900 py-3 rounded-lg font-medium mt-6"
                                >
                                    Pay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
} 