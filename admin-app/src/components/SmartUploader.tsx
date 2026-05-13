"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Upload, Image as ImageIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartUploaderProps {
  onUploadComplete: (url: string) => void;
  currentValue?: string;
  bucket?: string;
  label?: string;
  className?: string;
}

export default function SmartUploader({ 
  onUploadComplete, 
  currentValue, 
  bucket = "fleet",
  label = "Upload Image",
  className
}: SmartUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-admin-muted uppercase tracking-widest ml-1">{label}</label>
        {currentValue && (
          <button 
            onClick={() => onUploadComplete("")}
            className="text-[9px] font-bold text-rose-500 uppercase hover:underline flex items-center gap-1"
          >
            <X size={10} /> Clear
          </button>
        )}
      </div>

      <div 
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={cn(
          "relative aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3 group",
          currentValue ? "border-primary/20 bg-primary/5" : "border-slate-200 bg-slate-50 hover:border-primary/50 hover:bg-slate-100",
          uploading && "opacity-50 cursor-not-allowed"
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span className="text-[10px] font-black uppercase text-primary animate-pulse">Uploading to Cloud...</span>
          </div>
        ) : currentValue ? (
          <>
            <img src={currentValue} className="w-full h-full object-cover" alt="Preview" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                Change Image
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover:scale-110 group-hover:text-primary transition-all">
              <Upload size={20} />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-black text-admin-text uppercase tracking-tight">Drop Image or Click to Browse</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">PNG, JPG, WEBP (Max 5MB)</p>
            </div>
            <button 
              type="button"
              className="mt-2 bg-white px-4 py-1.5 rounded-full border border-slate-200 text-[9px] font-black uppercase tracking-widest text-admin-text hover:bg-slate-50 shadow-sm active:scale-95 transition-all"
            >
              Select File
            </button>
          </>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          className="hidden" 
          accept="image/*" 
        />
      </div>
    </div>
  );
}
