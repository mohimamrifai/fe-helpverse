import React from 'react';

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
  min?: string | number;
  max?: string | number;
  minLength?: number;
  icon?: React.ReactNode;
  className?: string;
  textarea?: boolean;
  rows?: number;
}

export function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  min,
  max,
  minLength,
  icon,
  className = '',
  textarea = false,
  rows = 4
}: FormInputProps) {
  const inputBaseClass = "mt-2 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm transition duration-150 ease-in-out";

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {icon ? (
        <div className="mt-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
          {textarea ? (
            <textarea
              id={name}
              name={name}
              value={value}
              onChange={onChange}
              required={required}
              rows={rows}
              className={`${inputBaseClass} pl-10`}
              placeholder={placeholder}
            />
          ) : (
            <input
              type={type}
              id={name}
              name={name}
              value={value}
              onChange={onChange}
              required={required}
              min={min}
              max={max}
              minLength={minLength}
              className={`${inputBaseClass} pl-10`}
              placeholder={placeholder}
            />
          )}
        </div>
      ) : (
        textarea ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            rows={rows}
            className={inputBaseClass}
            placeholder={placeholder}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            min={min}
            max={max}
            minLength={minLength}
            className={inputBaseClass}
            placeholder={placeholder}
          />
        )
      )}
    </div>
  );
} 