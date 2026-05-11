'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F1EDE4] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-10">
        <div className="w-24 h-24 bg-[#1A1A1A] rounded-[2rem] flex items-center justify-center mx-auto text-[#fcc200]">
           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-[#1A1A1A] uppercase tracking-tighter">Something went wrong</h2>
          <p className="text-sm font-bold text-[#1A1A1A]/40 uppercase tracking-widest leading-relaxed">
            We encountered an unexpected error while loading this page. 
          </p>
        </div>
        <div className="flex flex-col gap-4">
           <button 
             onClick={() => reset()}
             className="w-full bg-[#1A1A1A] text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#fcc200] hover:text-[#1A1A1A] transition-all shadow-xl"
           >
             Try Again
           </button>
           <a 
             href="/"
             className="w-full bg-white border border-black/5 text-[#1A1A1A] py-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#F1EDE4] transition-all"
           >
             Return Home
           </a>
        </div>
      </div>
    </div>
  );
}