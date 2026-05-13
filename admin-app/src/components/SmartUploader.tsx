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
          "relative aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-2",
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
          <img src={currentValue} className="w-full h-full object-cover" alt="Preview" />
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
              <Upload size={18} />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-admin-text uppercase tracking-tight">Drop Image or Click</p>
              <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">PNG, JPG, WEBP (Max 5MB)</p>
            </div>
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
