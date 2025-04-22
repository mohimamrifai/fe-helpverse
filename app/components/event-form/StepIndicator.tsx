import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  steps: {
    number: number;
    label: string;
  }[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className={`flex items-center ${step.number <= currentStep ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step.number <= currentStep ? 'border-indigo-600' : 'border-gray-300'
                }`}>
                  {step.number}
                </div>
                <div className="ml-2 text-sm font-medium">
                  {step.label}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 ${step.number < currentStep ? 'bg-indigo-600' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
} 