import React from 'react';

/**
 * Reusable Input component with icon support
 */
export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  inputClassName = '',
  disabled = false,
  required = false,
  ...props
}) {
  const baseInputClasses = `w-full rounded-2xl py-4 text-base font-semibold outline-none transition-all ${
    Icon ? 'pl-12 pr-4' : 'px-4'
  }`;
  
  const stateClasses = disabled
    ? 'bg-slate-100 border-2 border-slate-200 text-slate-600 cursor-not-allowed'
    : error
      ? 'bg-red-50 border-2 border-red-300 text-slate-700 focus:border-red-400'
      : 'bg-slate-50 border-2 border-slate-200 text-slate-700 focus:border-indigo-400 focus:bg-white';

  return (
    <div className={className}>
      {label && (
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        )}
        <input
          disabled={disabled}
          required={required}
          className={`${baseInputClasses} ${stateClasses} ${inputClassName}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}

/**
 * Textarea component
 */
export function Textarea({
  label,
  error,
  className = '',
  textareaClassName = '',
  disabled = false,
  required = false,
  rows = 4,
  ...props
}) {
  const baseClasses = 'w-full rounded-2xl px-4 py-4 text-base font-semibold outline-none transition-all resize-none';
  
  const stateClasses = disabled
    ? 'bg-slate-100 border-2 border-slate-200 text-slate-600 cursor-not-allowed'
    : error
      ? 'bg-red-50 border-2 border-red-300 text-slate-700 focus:border-red-400'
      : 'bg-slate-50 border-2 border-slate-200 text-slate-700 focus:border-indigo-400 focus:bg-white';

  return (
    <div className={className}>
      {label && (
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        disabled={disabled}
        required={required}
        rows={rows}
        className={`${baseClasses} ${stateClasses} ${textareaClassName}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}

/**
 * Select component
 */
export function Select({
  label,
  error,
  icon: Icon,
  options = [],
  placeholder = 'Select...',
  className = '',
  selectClassName = '',
  disabled = false,
  required = false,
  ...props
}) {
  const baseClasses = `w-full rounded-2xl py-4 text-base font-semibold outline-none transition-all appearance-none ${
    Icon ? 'pl-12 pr-10' : 'px-4 pr-10'
  }`;
  
  const stateClasses = disabled
    ? 'bg-slate-100 border-2 border-slate-200 text-slate-600 cursor-not-allowed'
    : error
      ? 'bg-red-50 border-2 border-red-300 text-slate-700 focus:border-red-400'
      : 'bg-slate-50 border-2 border-slate-200 text-slate-700 focus:border-indigo-400 focus:bg-white';

  return (
    <div className={className}>
      {label && (
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        )}
        <select
          disabled={disabled}
          required={required}
          className={`${baseClasses} ${stateClasses} ${selectClassName}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
