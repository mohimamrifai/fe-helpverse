import React from 'react';
import { FaArrowLeft, FaArrowRight, FaSpinner } from 'react-icons/fa';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
}

export function NavigationButtons({ 
  currentStep, 
  totalSteps, 
  onPrevious, 
  onNext,
  isNextDisabled = false,
  isSubmitting = false
}: NavigationButtonsProps) {
  return (
    <div className="px-2 sm:px-4 md:px-6 py-3 bg-gray-50 flex justify-between mt-4 rounded-md">
      {currentStep > 1 ? (
        <button
          type="button"
          onClick={onPrevious}
          disabled={isSubmitting}
          className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">Previous</span>
        </button>
      ) : (
        <div></div>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={isNextDisabled || isSubmitting}
        className={`inline-flex justify-center items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
          isNextDisabled || isSubmitting
            ? 'bg-indigo-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        } transition-colors duration-200`}
      >
        {isSubmitting && currentStep === totalSteps ? (
          <>
            <FaSpinner className="h-4 w-4 mr-1 sm:mr-2 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          currentStep < totalSteps ? (
            <>
              <span className="hidden xs:inline">Next Step</span>
              <span className="xs:hidden">Next</span>
              <FaArrowRight className="h-4 w-4 ml-1 sm:ml-2" />
            </>
          ) : (
            'Create Event'
          )
        )}
      </button>
    </div>
  );
} 