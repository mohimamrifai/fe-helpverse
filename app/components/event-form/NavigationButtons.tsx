import React from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function NavigationButtons({ currentStep, totalSteps, onPrevious, onNext }: NavigationButtonsProps) {
  return (
    <div className="px-6 md:px-8 py-4 bg-gray-50 flex justify-between">
      {currentStep > 1 && (
        <button
          type="button"
          onClick={onPrevious}
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FaArrowLeft className="h-5 w-5 mr-2" />
          Previous
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
      >
        {currentStep < totalSteps ? (
          <>
            Next Step
            <FaArrowRight className="h-5 w-5 ml-2" />
          </>
        ) : (
          'Create Event'
        )}
      </button>
    </div>
  );
} 