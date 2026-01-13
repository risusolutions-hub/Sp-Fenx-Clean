import React from 'react';

export default function FuturisticLoader({ message = 'Loading', fullScreen = false }){
  return (
    <div className={`${fullScreen ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/30' : 'flex items-center justify-center'}`}>
      <div className="bg-white/6 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-xl w-[520px] max-w-full text-center">
        <div className="mb-4 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-primary-500 rounded-full animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-white/90 mb-1">{message}</h3>
        <p className="text-sm text-white/70">Hang tight — fetching your data and preparing a smooth experience.</p>
      </div>
    </div>
  );
}
