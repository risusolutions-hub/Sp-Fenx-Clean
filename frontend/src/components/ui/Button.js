import React from 'react';

/**
 * Reusable Button component with variants
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 shadow-md',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
    outline: 'bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
    dark: 'bg-gray-800 text-white hover:bg-gray-900 shadow-md'
  };
  
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5',
    sm: 'px-3 py-2 text-sm rounded-xl gap-2',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
    xl: 'px-8 py-4 text-base rounded-2xl gap-3'
  };
  
  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-5 h-5'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className={`animate-spin ${iconSizes[size]}`} viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon && iconPosition === 'left' ? (
        <Icon className={iconSizes[size]} />
      ) : null}
      
      {children}
      
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={iconSizes[size]} />
      )}
    </button>
  );
}
