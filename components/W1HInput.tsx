import React from 'react';
import { LucideIcon } from 'lucide-react';

interface W1HInputProps {
  label: string;
  engLabel: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  accentColor: string;
  icon: LucideIcon;
  isAiLoading?: boolean;
}

const W1HInput: React.FC<W1HInputProps> = ({ 
  label, 
  engLabel, 
  value, 
  onChange, 
  placeholder, 
  accentColor, 
  icon: Icon,
  isAiLoading
}) => {
  // Map prop colors to Tailwind classes securely
  const getHeaderStyle = (colorClass: string) => {
    if (colorClass.includes('red')) return 'bg-red-50 text-red-600 border-red-200';
    if (colorClass.includes('orange')) return 'bg-orange-50 text-orange-600 border-orange-200';
    if (colorClass.includes('amber')) return 'bg-amber-50 text-amber-600 border-amber-200';
    if (colorClass.includes('emerald')) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (colorClass.includes('sky')) return 'bg-sky-50 text-sky-600 border-sky-200';
    return 'bg-violet-50 text-violet-600 border-violet-200'; // default
  };

  const getBorderColor = (colorClass: string) => {
     // Extracting color name roughly for border
     if (colorClass.includes('red')) return 'border-red-500';
     if (colorClass.includes('orange')) return 'border-orange-500';
     if (colorClass.includes('amber')) return 'border-amber-500';
     if (colorClass.includes('emerald')) return 'border-emerald-500';
     if (colorClass.includes('sky')) return 'border-sky-500';
     return 'border-violet-500';
  }

  const headerStyle = getHeaderStyle(accentColor);
  const borderStyle = getBorderColor(accentColor);

  return (
    <div className={`flex flex-col h-full page-break-avoid bg-white rounded-2xl border-2 ${borderStyle} shadow-sm hover:shadow-md transition-all duration-300 relative group`}>
      <div className={`px-5 py-3 border-b flex items-center justify-between rounded-t-xl ${headerStyle}`}>
        <label className="font-bold text-lg flex items-center gap-2.5">
          {Icon && <Icon size={20} strokeWidth={2.5} />}
          {label}
        </label>
        <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">{engLabel}</span>
      </div>
      <div className="relative flex-grow flex flex-col">
        <textarea
          className={`w-full p-5 bg-white rounded-b-xl focus:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-opacity-20 focus:ring-indigo-500 resize-none text-slate-800 text-lg leading-relaxed flex-grow min-h-[140px] placeholder:text-slate-300 transition-colors ${isAiLoading ? 'animate-pulse bg-slate-100' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={isAiLoading}
        />
        {isAiLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-b-xl">
               <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
               <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
            </div>
        )}
      </div>
    </div>
  );
};

export default W1HInput;