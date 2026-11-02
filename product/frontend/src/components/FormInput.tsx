import React from 'react';
import './FormInput.css';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  id,
  name,
  className = '',
  ...props
}) => {
  const inputId = id || name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={inputId} className="form-label">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error"`} className="form-error" role="alert">
          {error}
        </span>
      )}
      {helperText && !error && (
        <span id={`${inputId}-helper"`} className="form-helper">
          {helperText}
        </span>
      )}
    </div>
  );
};
