import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({ label, error, helperText, ...props }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <input
      className={`block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      {...props}
    />
    {helperText && !error && (
      <p className="mt-1 text-xs text-gray-500">{helperText}</p>
    )}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

export default Input;
