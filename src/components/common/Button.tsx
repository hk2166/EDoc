import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  children,
  className,
  disabled,
  ...rest
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 active:bg-secondary-700 text-white focus:ring-secondary-500',
    accent: 'bg-accent-500 hover:bg-accent-600 active:bg-accent-700 text-white focus:ring-accent-500',
    outline: 'border border-neutral-300 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-700 focus:ring-primary-500',
    ghost: 'text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500',
    danger: 'bg-error-500 hover:bg-error-600 active:bg-error-700 text-white focus:ring-error-500',
  };
  
  const sizeClasses = {
    small: 'text-sm py-1.5 px-3',
    medium: 'text-base py-2 px-4',
    large: 'text-lg py-3 px-6',
  };
  
  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';
  const loadingClasses = 'opacity-90 cursor-wait pointer-events-none';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClasses,
        (disabled || isLoading) && disabledClasses,
        isLoading && loadingClasses,
        className
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <>
          <svg 
            className={`animate-spin -ml-1 mr-2 h-4 w-4 ${iconPosition === 'right' ? 'order-last ml-2 -mr-1' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2">{icon}</span>
          )}
          <span>{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="ml-2">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;