import React from 'react';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import { FormInput } from './FormInput';
import type { EventDetails } from './types';

interface EventDetailsStepProps {
  eventDetails: EventDetails;
  onEventDetailsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
  errors?: {[key: string]: string};
}

export function EventDetailsStep({
  eventDetails,
  onEventDetailsChange,
  imagePreview,
  onImageChange,
  onImageRemove,
  errors = {}
}: EventDetailsStepProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <FormInput
        label="Event Name"
        name="name"
        value={eventDetails.name}
        onChange={onEventDetailsChange}
        required
        placeholder="Enter event name"
        error={errors.name}
      />

      <FormInput
        label="Event Description"
        name="description"
        value={eventDetails.description}
        onChange={onEventDetailsChange}
        required
        textarea
        placeholder="Include key details such as purpose, activities, and target audience"
        error={errors.description}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        <FormInput
          label="Event Date"
          name="date"
          type="date"
          value={eventDetails.date}
          onChange={onEventDetailsChange}
          required
          icon={<FaCalendarAlt className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />}
          error={errors.date}
        />
        <FormInput
          label="Event Time"
          name="time"
          type="time"
          value={eventDetails.time}
          onChange={onEventDetailsChange}
          required
          icon={<FaClock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />}
          error={errors.time}
        />
      </div>

      <FormInput
        label="Location"
        name="location"
        value={eventDetails.location}
        onChange={onEventDetailsChange}
        required
        placeholder="Enter event location"
        error={errors.location}
      />

      <FormInput
        label="Capacity"
        name="capacity"
        type="number"
        value={eventDetails.capacity}
        onChange={onEventDetailsChange}
        min={1}
        required
        error={errors.capacity}
      />

      <div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Event Poster</h2>
        <div className="mt-1 sm:mt-2">
          {imagePreview ? (
            <div className="relative w-[200px] h-[320px] sm:w-[250px] sm:h-[400px] mx-auto">
              <img
                src={imagePreview}
                alt="Event poster preview"
                className="w-full h-full object-cover rounded-lg shadow-sm"
              />
              <button
                type="button"
                onClick={onImageRemove}
                className="absolute -top-2 -right-2 p-1 sm:p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 shadow-md"
              >
                <svg className="h-2 w-2 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className={`w-[200px] h-[320px] sm:w-[250px] sm:h-[400px] border-2 border-dashed rounded-lg hover:border-indigo-500 transition-colors duration-200 flex items-center justify-center ${errors.image ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
                <div className="text-center p-2 sm:p-4">
                  <svg className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-1 sm:mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="flex text-xs sm:text-sm text-gray-600">
                    <label
                      htmlFor="poster"
                      className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload poster</span>
                      <input
                        id="poster"
                        name="poster"
                        type="file"
                        className="sr-only"
                        accept="image/jpeg,image/png"
                        required
                        onChange={onImageChange}
                      />
                    </label>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">JPG or PNG up to 5MB</p>
                  {errors.image && <p className="text-[10px] sm:text-xs text-red-500 mt-1">{errors.image}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 