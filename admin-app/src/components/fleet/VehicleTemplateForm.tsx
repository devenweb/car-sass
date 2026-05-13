"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Upload, Loader2, Zap, ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface VehicleTemplateFormProps {
  template: any;
  setTemplate: (template: any) => void;
  onSave: () => void;
  uploading: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  gallery: string[];
  setGallery: (gallery: string[]) => void;
  isNew?: boolean;
}

export function VehicleTemplateForm({
  template,
  setTemplate,
  onSave,
  uploading,
  handleImageUpload,
  gallery,
  setGallery,
  isNew = false
}: VehicleTemplateFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [newFeature, setNewFeature] = React.useState("");

  if (!template) return null;

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    const currentFeatures = template.features_json || [];
    setTemplate({ ...template, features_json: [...currentFeatures, newFeature.trim()] });
    setNewFeature("");
  };

  const handleRemoveFeature = (index: number) => {
    const currentFeatures = [...(template.features_json || [])];
    currentFeatures.splice(index, 1);
    setTemplate({ ...template, features_json: currentFeatures });
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // We pass this to the parent or handle it here?
    // Let's handle it in the parent to maintain state consistency with Supabase
    // But for now let's just trigger the parent's handler
    (handleImageUpload as any)(e, true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-admin-border shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/fleet" className="p-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
            <ArrowLeft size={20} className="text-slate-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-admin-text uppercase leading-none">
              {isNew ? "Register New Model" : `Edit ${template.brand} ${template.model}`}
            </h1>
            <p className="text-[10px] text-admin-muted font-bold uppercase mt-1">Vehicle Configuration Studio</p>
          </div>
        </div>
        <button 
          onClick={onSave}
          disabled={uploading}
          className="flex items-center gap-3 px-8 py-3 bg-primary text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Model
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Visuals */}
        <div className="w-full lg:w-[35%] space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-admin-border shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Hero Visual</h3>
            <div className="aspect-[4/3] relative rounded-3xl overflow-hidden border-2 border-dashed border-slate-100 bg-slate-50/50 flex items-center justify-center group">
              {template.default_thumbnail ? (
                <>
                  <Image src={template.default_thumbnail} alt="Preview" fill className="object-contain p-4" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="p-4 bg-white rounded-full shadow-2xl hover:scale-110 transition-all text-primary"
                    >
                      <Upload size={24}/>
                    </button>
                  </div>
                </>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 text-slate-400 hover:text-primary transition-colors">
                  <div className="w-16 h-16 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    <Upload size={24}/>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Click to Upload</span>
                </button>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span className="text-[10px] font-black uppercase text-primary">Uploading...</span>
                  </div>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase">
                 Recommended: Transparent PNG or high-quality studio shot. 4:3 Aspect ratio for best marketplace display.
               </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-admin-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gallery Assets</h3>
              <button 
                onClick={() => galleryInputRef.current?.click()}
                className="p-2 hover:bg-primary/5 text-primary rounded-lg transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {gallery.map((img, idx) => (
                <div key={idx} className="aspect-square relative rounded-2xl overflow-hidden border border-slate-100 group">
                  <Image src={img} alt="Gallery" fill className="object-cover" />
                  <button 
                    onClick={() => setGallery(gallery.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => galleryInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-primary hover:border-primary/20 transition-all"
              >
                <Plus size={20} />
                <span className="text-[8px] font-black uppercase tracking-widest">Add Image</span>
              </button>
            </div>
            <input type="file" ref={galleryInputRef} onChange={(e) => (handleImageUpload as any)(e, true)} className="hidden" accept="image/*" multiple />
          </div>
        </div>
        
        {/* Right Column: Configuration */}
        <div className="flex-1 space-y-6">
          <div className="bg-white p-10 rounded-[2.5rem] border border-admin-border shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Brand Name</label>
                <input type="text" value={template.brand || ''} onChange={e => setTemplate({...template, brand: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all" placeholder="e.g. Audi" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Model Series</label>
                <input type="text" value={template.model || ''} onChange={e => setTemplate({...template, model: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all" placeholder="e.g. A4 Premium" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Category</label>
                <select value={template.category || ''} onChange={e => setTemplate({...template, category: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[11px] outline-none">
                  <option>Economy</option><option>Sedan</option><option>SUV</option><option>MPV</option><option>Luxury</option><option>Hatchback</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Transmission</label>
                <select value={template.transmission || ''} onChange={e => setTemplate({...template, transmission: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[11px] outline-none">
                  <option>Automatic</option><option>Manual</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Fuel System</label>
                <select value={template.fuel_type || 'Petrol'} onChange={e => setTemplate({...template, fuel_type: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[11px] outline-none">
                  <option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>Electric</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Seats</label>
                  <input type="number" value={template.seats ?? 5} onChange={e => setTemplate({...template, seats: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Rating</label>
                  <input type="number" step="0.1" min="0" max="5" value={template.rating ?? 5.0} onChange={e => setTemplate({...template, rating: parseFloat(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs text-amber-500" />
                </div>
              </div>
            </div>

            {/* Marketing Section */}
            <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100/50 space-y-8 shadow-inner">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Zap size={16} />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Marketing & Pricing Effects</h3>
                 </div>
                 <span className="text-[8px] font-black uppercase text-emerald-600/40 tracking-widest">Global Marketplace Overrides</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-emerald-600/40 ml-2 tracking-widest">Strike Price (Rs)</label>
                  <input type="number" value={template.marketing_strikethrough_price || ''} onChange={e => setTemplate({...template, marketing_strikethrough_price: parseFloat(e.target.value)})} className="w-full p-4 bg-white border border-emerald-100 rounded-2xl font-black text-rose-500 shadow-sm text-sm outline-none" placeholder="e.g. 2500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-emerald-600/40 ml-2 tracking-widest">Fixed Discount (Rs)</label>
                  <input type="number" value={template.fixed_discount_amount ?? 0} onChange={e => setTemplate({...template, fixed_discount_amount: parseFloat(e.target.value)})} className="w-full p-4 bg-white border border-emerald-100 rounded-2xl font-black text-emerald-600 shadow-sm text-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-emerald-600/40 ml-2 tracking-widest">Standard Disc (%)</label>
                  <input type="number" value={template.percentage_discount_rate ?? 0} onChange={e => setTemplate({...template, percentage_discount_rate: parseFloat(e.target.value)})} className="w-full p-4 bg-white border border-emerald-100 rounded-2xl font-black text-emerald-600 shadow-sm text-sm outline-none" />
                </div>
              </div>

              <div className="pt-6 border-t border-emerald-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-emerald-600/40 ml-2 tracking-widest">Duration Threshold (Days)</label>
                    <input type="number" value={template.long_term_threshold_days ?? 5} onChange={e => setTemplate({...template, long_term_threshold_days: parseInt(e.target.value)})} className="w-full p-4 bg-white border border-emerald-100 rounded-2xl font-black shadow-sm text-sm outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-emerald-600/40 ml-2 tracking-widest">Long-Term Discount (%)</label>
                    <input type="number" value={template.long_term_discount_percent ?? 10} onChange={e => setTemplate({...template, long_term_discount_percent: parseFloat(e.target.value)})} className="w-full p-4 bg-white border border-emerald-100 rounded-2xl font-black text-indigo-600 shadow-sm text-sm outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Lrg Luggage</label>
                <input type="number" value={template.luggage_large ?? 2} onChange={e => setTemplate({...template, luggage_large: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Sml Luggage</label>
                <input type="number" value={template.luggage_small ?? 1} onChange={e => setTemplate({...template, luggage_small: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Doors</label>
                <input type="number" value={template.doors ?? 5} onChange={e => setTemplate({...template, doors: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Engine</label>
                <input type="text" value={template.engine_size || ''} onChange={e => setTemplate({...template, engine_size: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm outline-none" placeholder="e.g. 1.5L" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Marketplace URL (Slug)</label>
                <input type="text" value={template.slug || ''} onChange={e => setTemplate({...template, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs text-primary" placeholder="e.g. bmw-x3-luxury" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Base Rate (Fallback)</label>
                <input type="number" value={template.daily_price || ''} onChange={e => setTemplate({...template, daily_price: parseFloat(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" placeholder="e.g. 1500" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Marketing Description</label>
              <textarea value={template.description || ""} onChange={e => setTemplate({...template, description: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] min-h-[120px] text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all" placeholder="Describe the vehicle's unique selling points..." />
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Marketing Highlights (Features)</h3>
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={newFeature}
                  onChange={e => setNewFeature(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddFeature()}
                  className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs"
                  placeholder="Add a feature (e.g. Free Delivery)"
                />
                <button onClick={handleAddFeature} className="px-6 bg-primary text-white rounded-2xl font-black uppercase text-[10px]">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(template.features_json || []).map((feat: string, idx: number) => (
                  <div key={idx} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{feat}</span>
                    <button onClick={() => handleRemoveFeature(idx)} className="text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Vehicle Experiences (Tags)</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'family', label: 'Family & 7-Seaters' },
                  { id: 'honeymoon', label: 'Honeymoon Premium' },
                  { id: 'sporty', label: 'Sporty & Dynamic' },
                  { id: 'luxury', label: 'Luxury Executive' },
                  { id: 'economy', label: 'Daily Commute' }
                ].map((tag) => {
                  const isSelected = template.tags?.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        const currentTags = template.tags || [];
                        const newTags = isSelected
                          ? currentTags.filter((t: string) => t !== tag.id)
                          : [...currentTags, tag.id];
                        setTemplate({ ...template, tags: newTags });
                      }}
                      className={cn(
                        "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                        isSelected 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-white border-slate-100 text-slate-400 hover:border-primary/30"
                      )}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Air Con', key: 'air_conditioning' },
                  { label: 'HiFi Audio', key: 'has_hifi' },
                  { label: 'Bluetooth', key: 'has_bluetooth' },
                  { label: 'CarPlay', key: 'has_apple_carplay' },
                  { label: 'Android Auto', key: 'has_android_auto' }
                ].map((spec) => (
                  <label key={spec.key} className={cn(
                    "flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-all",
                    template[spec.key] ? "bg-primary/5 border-primary/20" : "bg-slate-50 border-transparent hover:border-slate-100"
                  )}>
                    <span className="text-[10px] font-black uppercase tracking-wider">{spec.label}</span>
                    <input 
                      type="checkbox" 
                      checked={template[spec.key] ?? false} 
                      onChange={e => setTemplate({...template, [spec.key]: e.target.checked})} 
                      className="w-5 h-5 text-primary rounded-lg border-slate-200" 
                    />
                  </label>
                ))}
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-transparent rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Airbags</span>
                  <input type="number" value={template.airbag_count ?? 2} onChange={e => setTemplate({...template, airbag_count: parseInt(e.target.value)})} className="w-12 bg-transparent font-black text-right text-xs focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-10 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <label className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-2xl cursor-pointer border-2 transition-all",
                  template.published_status === 'published' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 border-transparent text-slate-400"
                )}>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg"
                    checked={template.published_status === 'published'} 
                    onChange={e => setTemplate({...template, published_status: e.target.checked ? 'published' : 'draft'})} 
                  /> 
                  <span className="text-[11px] font-black uppercase tracking-widest">Public Visibility</span>
                </label>
              </div>
              <button 
                onClick={onSave}
                disabled={uploading}
                className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:bg-primary transition-all flex items-center gap-4"
              >
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Confirm & Save Model
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
