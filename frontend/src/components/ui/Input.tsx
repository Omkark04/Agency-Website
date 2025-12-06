import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`form-group ${error ? 'is-invalid' : ''}`}>
        {label && <label className="form-label">{label}</label>}
        <input
          ref={ref}
          className={`form-control ${className}`}
          {...props}
        />
        {error && <div className="invalid-feedback">{error}</div>}
        {helperText && <div className="form-text">{helperText}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';
