import React from 'react';

interface ErrorMessageProps {
  error?: string | null;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`mt-1 text-sm text-red-600 ${className}`} role="alert">
      {error}
    </div>
  );
};

export default ErrorMessage;