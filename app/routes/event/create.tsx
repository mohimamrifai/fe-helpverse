import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Navbar } from '~/components/navbar';
import { Footer } from '~/components/footer';
import { EventDetailsStep } from '~/components/event-form/EventDetailsStep';
import { TicketTypesStep } from '~/components/event-form/TicketTypesStep';
import { SeatArrangementStep } from '~/components/event-form/SeatArrangementStep';
import { PromotionalOffersStep } from '~/components/event-form/PromotionalOffersStep';
import { NavigationButtons } from '~/components/event-form/NavigationButtons';
import type { EventDetails, TicketType, PromotionalOffer } from '~/components/event-form/types';
import { AuthGuard } from '~/components/AuthGuard';
import { eventService } from '~/services/event';

export function meta() {
  return [
    { title: "Create Event - Helpverse" },
    { name: "description", content: "Create a new event" },
  ];
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isFormValid, setIsFormValid] = useState<{[key: number]: boolean}>({
    1: true, // Awalnya valid sampai user mencoba next
    2: true,
    3: true,
    4: true // Promo is optional, so it's valid by default
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formTouched, setFormTouched] = useState(false); // Flag untuk menandai form sudah disentuh

  // Development data
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: 0,
  });
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [newTicketType, setNewTicketType] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Promotional Offers state
  const [promotionalOffers, setPromotionalOffers] = useState<PromotionalOffer[]>([]);

  // Validasi form di setiap step, hanya jika form sudah disentuh
  useEffect(() => {
    if (formTouched) {
      validateCurrentStep();
    }
  }, [eventDetails, ticketTypes, currentStep, formTouched]);

  const validateCurrentStep = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Validasi Step 1: Event Details
    if (currentStep === 1) {
      if (!eventDetails.name) newErrors.name = 'Nama acara wajib diisi';
      if (!eventDetails.description) newErrors.description = 'Deskripsi acara wajib diisi';
      if (!eventDetails.date) newErrors.date = 'Tanggal acara wajib diisi';
      if (!eventDetails.time) newErrors.time = 'Waktu acara wajib diisi';
      if (!eventDetails.location) newErrors.location = 'Lokasi acara wajib diisi';
      if (!eventDetails.capacity || eventDetails.capacity <= 0) 
        newErrors.capacity = 'Kapasitas harus lebih dari 0';
      // if (!imagePreview) newErrors.image = 'Poster acara wajib diupload';
    }
    
    // Validasi Step 2: Ticket Types
    else if (currentStep === 2) {
      if (ticketTypes.length === 0) {
        newErrors.ticketTypes = 'Minimal harus ada 1 tipe tiket';
      } else {
        ticketTypes.forEach((ticket, index) => {
          if (!ticket.name) newErrors[`ticket-${index}-name`] = 'Nama tiket wajib diisi';
          if (!ticket.price || parseInt(ticket.price) <= 0) 
            newErrors[`ticket-${index}-price`] = 'Harga tiket harus lebih dari 0';
          if (!ticket.limit || parseInt(ticket.limit) <= 0)
            newErrors[`ticket-${index}-limit`] = 'Jumlah tiket harus lebih dari 0';
        });
      }
    }
    
    // Validasi Step 3: Seat Arrangement
    else if (currentStep === 3) {
      const hasSeatArrangement = ticketTypes.some(t => (t.rows || 0) > 0 && (t.columns || 0) > 0);
      if (!hasSeatArrangement && ticketTypes.length > 0) {
        newErrors.seatArrangement = 'Minimal satu tipe tiket harus memiliki pengaturan kursi';
      }
    }
    
    // Validasi Step 4: Promotional Offers (opsional)
    else if (currentStep === 4) {
      // Validasi format kode promo jika ada
      promotionalOffers.forEach((promo, index) => {
        if (!promo.name) {
          newErrors[`promo-${index}-name`] = 'Nama promo wajib diisi';
        }
        if (!promo.code) {
          newErrors[`promo-${index}-code`] = 'Kode promo wajib diisi';
        } else if (!/^[A-Z0-9_-]+$/.test(promo.code)) {
          newErrors[`promo-${index}-code`] = 'Kode promo hanya boleh berisi huruf kapital, angka, underscore, dan dash';
        }
        if (!promo.validFrom) {
          newErrors[`promo-${index}-validFrom`] = 'Tanggal mulai berlaku wajib diisi';
        }
        if (!promo.validUntil) {
          newErrors[`promo-${index}-validUntil`] = 'Tanggal berakhir wajib diisi';
        }
        if (promo.validFrom && promo.validUntil && new Date(promo.validFrom) > new Date(promo.validUntil)) {
          newErrors[`promo-${index}-dateRange`] = 'Tanggal mulai harus sebelum tanggal berakhir';
        }
        if (promo.discountValue <= 0) {
          newErrors[`promo-${index}-discountValue`] = 'Nilai diskon harus lebih dari 0';
        }
        if (promo.discountType === 'percentage' && promo.discountValue > 100) {
          newErrors[`promo-${index}-discountValue`] = 'Nilai diskon persentase tidak boleh lebih dari 100%';
        }
      });
    }
    
    setErrors(newErrors);
    setIsFormValid({
      ...isFormValid,
      [currentStep]: Object.keys(newErrors).length === 0
    });
  };

  const handleNext = () => {
    setFormTouched(true); // Mark form as touched when user tries to navigate
    validateCurrentStep();
    if (isFormValid[currentStep]) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmitEvent();
      }
    } else {
      // Tampilkan pesan error jika form tidak valid
      alert("Harap lengkapi semua field yang diperlukan sebelum melanjutkan.");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  const handleEventDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventDetails(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark as touched when user changes form values
    if (!formTouched) {
      setFormTouched(true);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Mark as touched when user uploads an image
      if (!formTouched) {
        setFormTouched(true);
      }
    }
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
    
    // Mark as touched when user removes an image
    if (!formTouched) {
      setFormTouched(true);
    }
  };

  const handleNewTicketTypeChange = (value: string) => {
    setNewTicketType(value);
    
    // Mark as touched when user types in new ticket type
    if (!formTouched) {
      setFormTouched(true);
    }
  };

  const handleAddTicketType = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTicketType.trim()) {
      const id = Date.now().toString();
      setTicketTypes(prev => [
        ...prev,
        { 
          id, 
          name: newTicketType.trim(), 
          price: '100000', 
          limit: '50', 
          rows: 5, 
          columns: 10,
          description: `Tiket ${newTicketType.trim()}`,
          category: 'Regular',
          maxPerOrder: '4',
          saleEndDate: eventDetails.date
        }
      ]);
      setNewTicketType('');
      
      // Mark as touched when user adds a ticket type
      if (!formTouched) {
        setFormTouched(true);
      }
    }
  };

  const handleRemoveTicketType = (id: string) => {
    setTicketTypes(prev => prev.filter(ticketType => ticketType.id !== id));
    
    // Mark as touched when user removes a ticket type
    if (!formTouched) {
      setFormTouched(true);
    }
  };

  const handleTicketTypeChange = (id: string, field: keyof TicketType, value: string) => {
    setTicketTypes(prev => prev.map(ticketType => 
      ticketType.id === id ? { ...ticketType, [field]: value } : ticketType
    ));
    
    // Mark as touched when user changes ticket type details
    if (!formTouched) {
      setFormTouched(true);
    }
  };

  // Promo handling functions
  const handleAddPromo = (promo: PromotionalOffer) => {
    setPromotionalOffers(prev => [...prev, promo]);
    
    // Mark as touched when user adds a promo
    if (!formTouched) {
      setFormTouched(true);
    }
  };

  const handleRemovePromo = (id: string) => {
    setPromotionalOffers(prev => prev.filter(promo => promo.id !== id));
    
    // Mark as touched when user removes a promo
    if (!formTouched) {
      setFormTouched(true);
    }
  };

  const handlePromoChange = (id: string, field: keyof PromotionalOffer, value: any) => {
    setPromotionalOffers(prev => 
      prev.map(promo => 
        promo.id === id ? { ...promo, [field]: value } : promo
      )
    );
    
    // Mark as touched when user changes promo details
    if (!formTouched) {
      setFormTouched(true);
    }
  };

  const handleSubmitEvent = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Membuat struktur data untuk dikirim ke server
      const formattedTicketTypes = ticketTypes.map(ticket => ({
        name: ticket.name,
        price: parseInt(ticket.price),
        category: ticket.category || ticket.name,
        description: ticket.description || `Tiket ${ticket.name}`,
        quantity: parseInt(ticket.limit),
        maxPerOrder: parseInt(ticket.maxPerOrder || '4'),
        saleEndDate: ticket.saleEndDate || eventDetails.date // Default to event date if not set
      }));

      // Membuat objek seatArrangement untuk memenuhi persyaratan validasi API
      // Ambil tipe tiket dengan pengaturan kursi terbanyak sebagai dasar
      const ticketWithLargestSeatConfig = [...ticketTypes].sort((a, b) => 
        ((b.rows || 0) * (b.columns || 0)) - ((a.rows || 0) * (a.columns || 0))
      )[0];
      
      // Buat struktur seatArrangement minimal yang diperlukan
      const seatArrangement = {
        rows: ticketWithLargestSeatConfig?.rows || 1,
        columns: ticketWithLargestSeatConfig?.columns || 1,
        seats: [
          {
            id: "A1",
            status: "available" as "available" | "reserved" | "selected" | "booked",
            price: parseInt(ticketWithLargestSeatConfig?.price || "0")
          }
        ]
      };

      // Format final sesuai dengan yang diinginkan server
      const eventData = {
        name: eventDetails.name,
        description: eventDetails.description,
        date: eventDetails.date,
        time: eventDetails.time,
        location: eventDetails.location,
        image: imageFile ? imageFile.name : "event-poster.jpg", // Ubah ini sesuai dengan upload file yang sebenarnya
        capacity: eventDetails.capacity,
        ticketTypes: formattedTicketTypes,
        seatArrangement: seatArrangement,
        promotionalOffers
      };

      console.log('Data yang akan dikirim ke server:', eventData);
      
      // Kirim data ke API
      // Karena format data API berbeda, kita perlu menyesuaikan dengan format API
      const apiEventData = {
        name: eventData.name,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        address: eventData.location,
        category: "Event",
        image: eventData.image,
        totalSeats: eventData.capacity,
        availableSeats: eventData.capacity,
        ticketTypes: formattedTicketTypes.map(ticket => ({
          _id: Date.now() + Math.random().toString(36).substring(2, 9),
          id: Date.now() + Math.random().toString(36).substring(2, 9),
          name: ticket.name,
          description: ticket.description,
          price: ticket.price.toString(),
          category: ticket.category,
          available: ticket.quantity,
          total: ticket.quantity,
          maxPerOrder: ticket.maxPerOrder,
          limit: ticket.quantity.toString()
        })),
        seatArrangement: seatArrangement,
        published: true,
        organizer: {
          _id: "", // Akan diisi oleh server berdasarkan token
          name: "", // Akan diisi oleh server berdasarkan token
          email: "" // Akan diisi oleh server berdasarkan token
        },
        approvalStatus: "pending",
        approvalNotes: "",
        createdAt: new Date().toISOString(),
        promotionalOffers
      };

      const response = await eventService.createEvent(apiEventData as any);
      console.log('Response dari server:', response);
      
      // Setelah event dibuat, buat kursi untuk setiap tipe tiket
      if (response && response.id) {
        const eventId = response.id;
        
        // Cari tiket yang memiliki konfigurasi kursi
        const ticketsWithSeats = ticketTypes.filter(
          ticket => ticket.rows && ticket.columns && ticket.rows > 0 && ticket.columns > 0
        );
        
        if (ticketsWithSeats.length > 0) {
          try {
            // Hitung total kapasitas dari event
            const totalCapacity = parseInt(eventDetails.capacity.toString());
            
            // Buat array untuk ticketDistribution
            const ticketDistribution = [];
            let totalAllocatedSeats = 0;
            
            // Cari ID tiket dari response untuk setiap tiket
            for (const ticket of ticketsWithSeats) {
              // Cari tiket di response berdasarkan nama
              const createdTicket = response.ticketTypes?.find(
                (t: any) => t.name === ticket.name
              );
              
              if (createdTicket && createdTicket._id) {
                // Gunakan quantity dari limit tiket, bukan rows x columns
                const seatCount = parseInt(ticket.limit);
                
                // Pastikan tidak melebihi kapasitas yang tersisa
                const availableCount = Math.min(seatCount, totalCapacity - totalAllocatedSeats);
                
                if (availableCount > 0) {
                  ticketDistribution.push({
                    ticketType: createdTicket._id,
                    count: availableCount
                  });
                  
                  totalAllocatedSeats += availableCount;
                }
              }
            }
            
            if (ticketDistribution.length > 0 && totalAllocatedSeats > 0) {
              // Hitung jumlah baris dan kursi per baris berdasarkan total kursi
              // yang akan dialokasikan
              const seatsPerRow = 25; // Standar, bisa disesuaikan
              const totalRows = Math.ceil(totalAllocatedSeats / seatsPerRow);
              
              // Pastikan tidak melebihi batas alfabet A-Z
              const maxRows = Math.min(totalRows, 26); // Maksimal 26 baris (A-Z)
              
              // Format rows dalam bentuk "A-X" sesuai jumlah baris
              const startRow = 'A';
              const endRow = String.fromCharCode(startRow.charCodeAt(0) + maxRows - 1);
              const rowsFormat = `${startRow}-${endRow}`;
              
              // Buat kursi massal untuk semua tipe tiket sekaligus
              await eventService.createBulkSeats(
                eventId,
                {
                  section: "SECTION-A",
                  rows: rowsFormat,
                  seatsPerRow: seatsPerRow,
                  basePrice: parseInt(ticketsWithSeats[0].price || "0"),
                  ticketDistribution: ticketDistribution,
                  seatNumbering: 'alpha',
                  useTicketTypePrice: true
                }
              );
              console.log(`Kursi untuk ${ticketDistribution.length} tipe tiket berhasil dibuat dengan total ${totalAllocatedSeats} kursi`);
            } else {
              console.error('Tidak ada kursi yang dapat dialokasikan, periksa kapasitas event dan jumlah tiket');
            }
          } catch (error) {
            console.error(`Error membuat kursi:`, error);
          }
        }
      }
      
      // Tampilkan modal sukses
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating event:', error);
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Terjadi kesalahan saat membuat event');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { 
      title: 'Event Details', 
      component: <EventDetailsStep 
        eventDetails={eventDetails}
        onEventDetailsChange={handleEventDetailsChange}
        imagePreview={imagePreview}
        onImageChange={handleImageChange}
        onImageRemove={handleImageRemove}
        errors={errors}
        formTouched={formTouched}
      /> 
    },
    { 
      title: 'Ticket Types', 
      component: <TicketTypesStep 
        ticketTypes={ticketTypes}
        newTicketType={newTicketType}
        onNewTicketTypeChange={handleNewTicketTypeChange}
        onAddTicketType={handleAddTicketType}
        onRemoveTicketType={handleRemoveTicketType}
        onTicketTypeChange={handleTicketTypeChange}
        errors={errors}
      /> 
    },
    { 
      title: 'Seat Arrangement', 
      component: <SeatArrangementStep 
        ticketTypes={ticketTypes} 
        onSeatLayoutChange={(ticketId, rows, columns) => {
          setTicketTypes(prev => prev.map(ticket => 
            ticket.id === ticketId ? { ...ticket, rows, columns } : ticket
          ));
        }}
        errors={errors}
      /> 
    },
    { 
      title: 'Promotional Offers', 
      component: <PromotionalOffersStep 
        promotionalOffers={promotionalOffers}
        onAddPromo={handleAddPromo}
        onRemovePromo={handleRemovePromo}
        onPromoChange={handlePromoChange}
        errors={errors}
      /> 
    },
  ];

  return (
    <AuthGuard allowedRoles={['eventOrganizer']}>
      <main className="min-h-screen bg-secondary">
        <Navbar />
        <div className="max-w-7xl mx-auto py-3 sm:py-6 md:py-10 px-3 sm:px-6 lg:px-8">
          <div className="px-0 sm:px-2">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-3 sm:mb-4">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">Create New Event</h1>
                <p className="mt-1 text-xs sm:text-sm text-foreground-muted">
                  Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
                </p>
              </div>

              <div className="bg-secondary rounded-lg p-2 sm:p-4 md:p-6">
                {steps[currentStep - 1].component}
                
                {/* Error summary jika ada error di step saat ini */}
                {formTouched && Object.keys(errors).length > 0 && (
                  <div className="mt-3 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-md">
                    <h3 className="text-xs sm:text-sm font-medium text-red-800">Harap perbaiki error berikut:</h3>
                    <ul className="mt-1 text-xs sm:text-sm text-red-700 list-disc list-inside">
                      {Object.values(errors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Submit error message */}
                {submitError && (
                  <div className="mt-3 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-md">
                    <h3 className="text-xs sm:text-sm font-medium text-red-800">Error saat membuat event:</h3>
                    <p className="mt-1 text-xs sm:text-sm text-red-700">{submitError}</p>
                  </div>
                )}
                
                <NavigationButtons
                  currentStep={currentStep}
                  totalSteps={steps.length}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  isNextDisabled={!isFormValid[currentStep] || isSubmitting}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>
        <Footer />

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 mb-3 sm:mb-4">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Event Created Successfully!</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Your event has been created successfully. You will be redirected to the home page.
                </p>
                <button
                  onClick={handleSuccessModalClose}
                  className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
} 