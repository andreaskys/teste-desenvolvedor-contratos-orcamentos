import React from 'react';

const PlaceholderPage: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in zoom-in-95 duration-700">
      <div className="w-24 h-24 bg-gray-100 rounded-[32px] flex items-center justify-center mb-6 shadow-inner border-2 border-white">
        <span className="text-4xl text-gray-300">🚧</span>
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">{title}</h1>
      <p className="text-gray-500 font-medium">{description}</p>
      <div className="mt-8 px-6 py-2 bg-[#0071E3]/10 text-[#0071E3] font-bold text-xs uppercase tracking-widest rounded-full">
        Em Desenvolvimento
      </div>
    </div>
  );
};

export default PlaceholderPage;