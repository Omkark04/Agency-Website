import React from 'react';
type ButtonVariant = 'primary' | 'secondary' | 'outline';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  isLoading?: boolean; 
  size?: 'sm'|'md'|'lg';
  variant?: ButtonVariant;
};

export const Button: React.FC<Props> = ({ 
  children, 
  isLoading, 
  size = 'md',
  variant = 'primary',
  className = '',
  ...rest 
}) => {
  const sizeCls = size === 'sm' ? 'px-3 py-1 text-sm' : size === 'lg' ? 'px-6 py-3 text-lg' : 'px-4 py-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    outline: 'bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700'
  };

  return (
    <button
      className={`rounded ${variantClasses[variant]} ${sizeCls} disabled:opacity-60 ${className}`}
      {...rest}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
export default Button;
