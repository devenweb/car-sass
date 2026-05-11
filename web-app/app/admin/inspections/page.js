'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Camera, 
  Video, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Car, 
  ArrowLeft,
  Rotate3d,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CarInspectionPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  useEffect(() => {
    fetchActiveRentals();
  }, []);

  async function fetchActiveRentals() {
    setLoading(true);
    // Fetch rentals that are 'confirmed' or 'delivered' for the inspection process
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        cars (*),
        customers (*)
      `)
      .in('status', ['confirmed', 'delivered'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error:', error);
    } else {
      setRentals(data || []);
    }
    setLoading(false);
  }

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (max 50MB for demo, can be adjusted)
    if (file.size > 50 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Video size exceeds 50MB limit.' });
      return;
    }

    setVideoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage({ type: '', text: '' });
  };

  const handleUpload = async () => {
    if (!videoFile || !selectedRental) return;

    setUploading(true);
    setMessage({ type: 'info', text: 'Optimizing and uploading 360° inspection video...' });

    try {
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${selectedRental.id}_360_${Math.random()}.${fileExt}`;
      const filePath = `inspections/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('car-videos')
        .upload(filePath, videoFile);

      if (uploadError) throw uploadError;

      // Update rental with video path
      const { error: updateError } = await supabase
        .from('rentals')
        .update({ 
          inspection_video_url: filePath,
          last_inspected_at: new Date().toISOString()
        })
        .eq('id', selectedRental.id);

      if (updateError) throw updateError;

      setMessage({ type: 'success', text: 'Inspection video uploaded successfully!' });
      setVideoFile(null);
      setPreviewUrl(null);
      setTimeout(() => {
         setSelectedRental(null);
         fetchActiveRentals();
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload video. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F1EDE4]">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="inline-block px-3 py-1 bg-[#1A1A1A] text-brand-yellow rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                Agent Terminal
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-black text-[#1A1A1A] uppercase tracking-tighter leading-none">
                Vehicle <br />
                <span className="text-[#1A1A1A]/40 italic">Inspections</span>
              </h1>
            </div>
            {selectedRental && (
              <button 
                onClick={() => setSelectedRental(null)}
                className="flex items-center gap-2 text-[#1A1A1A]/40 font-black uppercase tracking-widest text-xs hover:text-[#1A1A1A] transition-colors"
              >
                <ArrowLeft size={16} /> Back to List
              </button>
            )}
          </div>

          {message.text && (
            <div className={`mb-8 p-6 rounded-3xl flex items-center gap-4 border ${
              message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
              message.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' : 
              'bg-blue-50 border-blue-100 text-blue-700'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              <p className="font-bold uppercase tracking-tight text-sm">{message.text}</p>
            </div>
          )}

          {!selectedRental ? (
            <div className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#1A1A1A]/30 mb-8">Active Assignments</h2>
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-brand-yellow" />
                </div>
              ) : rentals.length > 0 ? (
                rentals.map((rental) => (
                  <div 
                    key={rental.id}
                    onClick={() => setSelectedRental(rental)}
                    className="group bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col md:flex-row items-center gap-8"
                  >
                    <div className="w-full md:w-48 aspect-video rounded-2xl overflow-hidden bg-slate-100">
                      <img src={rental.cars?.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${rental.status === 'confirmed' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/40">{rental.status}</span>
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tight text-[#1A1A1A]">{rental.cars?.name}</h3>
                      <p className="text-xs font-bold text-[#1A1A1A]/60">Client: {rental.customers?.full_name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {rental.inspection_video_url ? (
                        <div className="flex items-center gap-2 text-emerald-500">
                          <Check size={20} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Inspected</span>
                        </div>
                      ) : (
                        <div className="px-6 py-3 bg-brand-yellow rounded-full text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] group-hover:px-8 transition-all">
                          Start Inspection
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-[3rem] p-20 text-center border border-black/5">
                  <Car className="w-12 h-12 text-[#1A1A1A]/10 mx-auto mb-6" />
                  <p className="text-[#1A1A1A]/40 font-black uppercase tracking-widest text-xs">No active assignments found</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-12 border border-black/5 shadow-2xl space-y-12">
              <div className="flex flex-col md:flex-row gap-8 items-start pb-12 border-b border-black/5">
                <div className="w-full md:w-64 aspect-video rounded-3xl overflow-hidden shadow-xl">
                  <img src={selectedRental.cars?.image_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-black uppercase tracking-tight text-[#1A1A1A]">{selectedRental.cars?.name}</h2>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                    <div>
                      <p className="text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-widest">Client</p>
                      <p className="text-sm font-bold">{selectedRental.customers?.full_name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-widest">Booking ID</p>
                      <p className="text-sm font-mono font-bold">#{selectedRental.id.slice(0,8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-yellow flex items-center justify-center text-black">
                    <Rotate3d size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">360° Quality Capture</h3>
                    <p className="text-xs font-medium text-[#1A1A1A]/40">Record a slow walk-around of the vehicle for verification.</p>
                  </div>
                </div>

                {!previewUrl ? (
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="video/*"
                      capture="environment"
                      onChange={handleVideoSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="h-64 rounded-[2.5rem] border-2 border-dashed border-black/10 group-hover:border-brand-yellow transition-colors flex flex-col items-center justify-center gap-4 bg-slate-50/50">
                      <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-[#1A1A1A]/20 group-hover:text-brand-yellow transition-all">
                        <Video size={32} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/40">Tap to record or upload inspection</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl bg-black">
                      <video src={previewUrl} controls className="w-full h-full" />
                      <button 
                        onClick={() => { setPreviewUrl(null); setVideoFile(null); }}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-rose-500 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-full py-6 bg-[#1A1A1A] text-brand-yellow rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Uploading Final Inspection...
                        </>
                      ) : (
                        <>
                          <Upload size={20} />
                          Finalize Inspection
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 bg-[#F1EDE4] rounded-3xl flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-[#1A1A1A]/40 shrink-0 mt-1" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest">Protocol Reminder</p>
                  <p className="text-[10px] font-bold text-[#1A1A1A]/40 leading-relaxed">
                    Ensure the vehicle is clean, the 360° walk-around is steady, and all pre-existing damages (if any) are clearly visible in the up-close segments. Max file size: 50MB.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
