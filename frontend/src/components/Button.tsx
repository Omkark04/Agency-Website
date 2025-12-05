import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition focus:outline-none';
  const variants: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-900 bg-white hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-900 hover:bg-gray-100',
    link: 'text-blue-600 underline hover:text-blue-700',
  };
  return (
    <button
      className={[
        base,
        variants[variant],
        fullWidth ? 'w-full' : '',
        props.disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
