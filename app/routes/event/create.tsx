import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Navbar } from '~/components/navbar';
import { Footer } from '~/components/footer';
import { EventDetailsStep } from '~/components/event-form/EventDetailsStep';
import { TicketTypesStep } from '~/components/event-form/TicketTypesStep';
import { SeatArrangementStep } from '~/components/event-form/SeatArrangementStep';
import { NavigationButtons } from '~/components/event-form/NavigationButtons';
import type { EventDetails, TicketType } from '~/components/event-form/types';

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
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: 0,
  });
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { id: '1', name: 'Regular', price: '100000', limit: '50', rows: 0, columns: 0 },
    { id: '2', name: 'VIP', price: '200000', limit: '30', rows: 0, columns: 0 },
  ]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSuccessModal(true);
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
  };

  const steps = [
    { 
      title: 'Event Details', 
      component: <EventDetailsStep 
        eventDetails={eventDetails}
        onEventDetailsChange={handleEventDetailsChange}
        imagePreview={null}
        onImageChange={() => {}}
        onImageRemove={() => {}}
      /> 
    },
    { 
      title: 'Ticket Types', 
      component: <TicketTypesStep 
        ticketTypes={ticketTypes}
        newTicketType=""
        onNewTicketTypeChange={() => {}}
        onAddTicketType={() => {}}
        onRemoveTicketType={() => {}}
        onTicketTypeChange={() => {}}
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
      /> 
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-16 md:py-28 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
              <p className="mt-2 text-sm text-gray-600">
                Step {currentStep} of {steps.length}
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              {steps[currentStep - 1].component}
              <NavigationButtons
                currentStep={currentStep}
                totalSteps={steps.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Event Created Successfully!</h3>
              <p className="text-sm text-gray-500 mb-4">
                Your event has been created successfully. You will be redirected to the home page.
              </p>
              <button
                onClick={handleSuccessModalClose}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 