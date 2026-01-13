import React from 'react';

export default function Loader({ message = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Spinner */}
      <div className="relative w-12 h-12">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
        {/* Animated ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin"></div>
      </div>

      {/* Message */}
      {message && (
        <p className="text-sm font-medium text-slate-700 text-center">
          {message}
        </p>
      )}

      {/* Loading dots animation */}
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0s' }}></span>
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.1s' }}></span>
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 shadow-xl">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
}
