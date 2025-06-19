import React, { forwardRef } from 'react';
import ErrorMessage from './ErrorMessage';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  required?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconClick,
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      required = false,
      id,
      className,
      ...rest
    },
    ref
  ) => {
    // Generar un ID único si no se proporciona
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determinar clases para el input basadas en estado de error
    const inputBaseClasses = 'block w-full px-3 py-2 appearance-none focus:outline-none transition-colors duration-200 ease-in-out';
    const inputStateClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-200 text-red-900 placeholder-red-300'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 text-gray-900 placeholder-gray-400';
    
    // Clases para bordes redondeados según presencia de iconos
    const borderRadiusClasses = leftIcon
      ? rightIcon
        ? 'rounded-md'
        : 'rounded-l-md'
      : rightIcon
      ? 'rounded-r-md'
      : 'rounded-md';
    
    // Clases para padding según presencia de iconos
    const paddingClasses = leftIcon
      ? 'pl-10'
      : rightIcon
      ? 'pr-10'
      : '';
    
    // Combinar todas las clases para el input
    const finalInputClasses = `${inputBaseClasses} ${inputStateClasses} ${borderRadiusClasses} ${paddingClasses} ${inputClassName}`;

    return (
      <div className={`mb-4 ${containerClassName}`}>
        {/* Label del input */}
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
          >
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}
        
        {/* Contenedor del input y los iconos */}
        <div className="relative">
          {/* Icono izquierdo */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{leftIcon}</span>
            </div>
          )}
          
          {/* Input */}
          <input
            id={inputId}
            ref={ref}
            className={finalInputClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...rest}
          />
          
          {/* Icono derecho (puede ser clicable) */}
          {rightIcon && (
            <div
              className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'
              }`}
              onClick={onRightIconClick}
            >
              <span className="text-gray-500 sm:text-sm">{rightIcon}</span>
            </div>
          )}
        </div>
        
        {/* Mensaje de error */}
        {error && <ErrorMessage error={error}  />}
        
        {/* Texto de ayuda */}
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;