import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  label?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  label,
  className
}) => {
  const sizeMap = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  
  const textSizeMap = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };
  
  const colorMap = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    white: 'text-white'
  };
  
  const spinTransition = {
    loop: Infinity,
    ease: "linear",
    duration: 1
  };
  
  return (
    <div className={clsx('flex flex-col items-center justify-center', className)}>
      <motion.div
        className={clsx(sizeMap[size], colorMap[color])}
        animate={{ rotate: 360 }}
        transition={spinTransition}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
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
      </motion.div>
      
      {label && (
        <p className={clsx('mt-2', textSizeMap[size], colorMap[color])}>
          {label}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;