'use client';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F1EDE4] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-10">
        <div className="w-24 h-24 bg-[#1A1A1A] rounded-[2rem] flex items-center justify-center mx-auto text-[#fcc200]">
           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
        </div>
        <div className="space-y-4">
           <span className="text-[10px] font-black text-[#fcc200] uppercase tracking-[0.4em]">Error 404</span>
           <h2 className="text-4xl font-black text-[#1A1A1A] uppercase tracking-tighter">Lost in Mauritius?</h2>
           <p className="text-sm font-bold text-[#1A1A1A]/40 uppercase tracking-widest leading-relaxed">
             The page you are looking for has been moved or does not exist. 
           </p>
        </div>
        <a 
           href="/"
           className="inline-block w-full bg-[#1A1A1A] text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#fcc200] hover:text-[#1A1A1A] transition-all shadow-xl"
        >
           Back to Safety
        </a>
      </div>
    </div>
  );
}