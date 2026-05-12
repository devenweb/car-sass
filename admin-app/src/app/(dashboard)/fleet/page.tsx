"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye, Car as CarIcon, 
  X, ChevronDown, ChevronRight, Settings, Calendar, Wrench, AlertTriangle, CheckCircle2,
  Trash, Upload, Save, Loader2, Info, History, Gauge
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function FleetPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [selectedUnitForMaint, setSelectedUnitForMaint] = useState<any>(null);
  
  const [uploading, setUploading] = useState(false);
  const [maintDescription, setMaintDescription] = useState("");
  const [isSavingMaint, setIsSavingMaint] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchFleet(); }, []);

  const fetchFleet = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicle_templates')
        .select('*, units:vehicle_units(*)')
        .order('brand', { ascending: true });
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const openEditModal = (template: any) => {
    setEditingTemplate(template || {
      brand: "", model: "", category: "Economy",
      transmission: "Automatic", seats: 5, description: "",
      published_status: "published"
    });
    setIsModalOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate.brand || !editingTemplate.model) return;
    setUploading(true);
    
    // Clean the object before upserting
    const { units, pricing, ...templateToSave } = editingTemplate;
    
    const { error } = await supabase.from('vehicle_templates').upsert(templateToSave);
    if (error) {
      console.error("Template save error:", error);
      alert("Error saving template: " + error.message);
    } else { 
      setIsModalOpen(false); 
      fetchFleet(); 
    }
    setUploading(false);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from('vehicle_templates').delete().eq('id', id);
    if (error) alert("Error deleting template");
    else fetchFleet();
  };

  const openUnitModal = (unit: any, templateId?: string) => {
    setEditingUnit(unit || {
      vehicle_template_id: templateId, plate_number: "",
      vin: "", color: "White", mileage: 0,
      availability_status: "available", internal_reference: ""
    });
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = async () => {
    if (!editingUnit.plate_number) return;
    setUploading(true);
    
    // Clean the object before upserting
    const { ...unitToSave } = editingUnit;
    
    const { error } = await supabase.from('vehicle_units').upsert(unitToSave);
    if (error) {
      console.error("Unit save error:", error);
      alert("Error saving unit: " + error.message);
    } else { 
      setIsUnitModalOpen(false); 
      fetchFleet(); 
    }
    setUploading(false);
  };

  const handleDeleteUnit = async (id: string) => {
    if (!confirm("Remove unit?")) return;
    const { error } = await supabase.from('vehicle_units').delete().eq('id', id);
    if (error) alert("Error deleting unit");
    else fetchFleet();
  };

  const openMaintenance = (unit: any) => {
    setSelectedUnitForMaint(unit);
    setMaintDescription("");
    setIsMaintModalOpen(true);
  };

  const handleLogMaintenance = async () => {
    if (!maintDescription || !selectedUnitForMaint) return;
    setIsSavingMaint(true);
    try {
      const { error } = await supabase.from('vehicle_maintenance_records').insert({
        vehicle_unit_id: selectedUnitForMaint.id,
        maintenance_type: maintDescription,
        service_date: new Date().toISOString().split('T')[0],
        description: `Logged via Fleet Manager: ${maintDescription}`
      });

      if (error) throw error;

      // Optional: Update unit status to maintenance if it wasn't already?
      // Or just leave it as is. Let's just log for now as requested.

      setIsMaintModalOpen(false);
      fetchFleet();
    } catch (error: any) {
      console.error("Maintenance log error:", error);
      alert("Error logging maintenance: " + error.message);
    } finally {
      setIsSavingMaint(false);
    }
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !editingTemplate) return;
    setUploading(true);
    const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('fleet').upload(`templates/${fileName}`, file);
    if (uploadError) alert("Upload failed");
    else {
      const { data: { publicUrl } } = supabase.storage.from('fleet').getPublicUrl(`templates/${fileName}`);
      setEditingTemplate({ ...editingTemplate, image_url: publicUrl, default_thumbnail: publicUrl });
    }
    setUploading(false);
  };

  const filteredTemplates = templates.filter(t => 
    `${t.brand} ${t.model}`.toLowerCase().includes(searchQuery.toLowerCase())
  );  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between bg-white p-8 rounded-2xl border border-admin-border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Manager</h1>
          <p className="text-slate-500">Manage models and units.</p>
        </div>
        <button onClick={() => openEditModal(null)} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
          <Plus size={20} /> Add New Model
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Models", value: templates.length, color: "bg-blue-500" },
          { label: "Total Units", value: templates.reduce((acc, t) => acc + (t.units?.length || 0), 0), color: "bg-indigo-500" },
          { label: "Available", value: templates.reduce((acc, t) => acc + (t.units?.filter((u:any) => u.availability_status === 'available').length || 0), 0), color: "bg-emerald-500" },
          { label: "Maintenance", value: templates.reduce((acc, t) => acc + (t.units?.filter((u:any) => u.availability_status === 'maintenance').length || 0), 0), color: "bg-amber-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-admin-border shadow-sm flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg", stat.color)}><CarIcon size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-admin-text">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-admin-border shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-admin-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-admin-border">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Model Details</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Inventory</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Catalog</th>
                <th className="px-8 py-5 text-right text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400">Loading...</td></tr>
              ) : filteredTemplates.map((template) => {
                const units = template.units || [];
                return (
                  <React.Fragment key={template.id}>
                    <tr className={cn("group hover:bg-slate-50/50 cursor-pointer", expandedRows.has(template.id) && "bg-slate-50/80")} onClick={() => toggleRow(template.id)}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          {expandedRows.has(template.id) ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                          <div className="w-20 h-12 relative rounded-lg overflow-hidden border bg-slate-100">
                            <Image src={template.image_url || template.default_thumbnail || "/placeholder-car.png"} alt={template.brand} fill className="object-cover" />
                          </div>
                          <div><p className="text-lg font-bold">{template.brand} {template.model}</p></div>
                        </div>
                      </td>
                      <td className="px-8 py-6"><span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black uppercase">{template.category}</span></td>
                      <td className="px-8 py-6">
                        <div className="flex gap-4">
                          <div><p className="text-lg font-black">{units.length}</p><p className="text-[8px] uppercase text-slate-400 font-bold">Total</p></div>
                          <div><p className="text-lg font-black text-emerald-500">{units.filter((u:any) => u.availability_status === 'available').length}</p><p className="text-[8px] uppercase text-slate-400 font-bold">Ready</p></div>
                        </div>
                      </td>
                      <td className="px-8 py-6"><span className="text-xs font-bold capitalize">{template.published_status}</span></td>
                      <td className="px-8 py-6 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(template)} className="p-2 hover:bg-primary/10 rounded-xl"><Edit2 size={18}/></button>
                          <button onClick={() => handleDeleteTemplate(template.id)} className="p-2 hover:bg-rose-500/10 rounded-xl"><Trash size={18}/></button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(template.id) && (
                      <tr className="bg-slate-50/30">
                        <td colSpan={5} className="px-20 py-6">
                          <div className="flex justify-between border-b pb-2 mb-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Physical Units</h4>
                            <button onClick={() => openUnitModal(null, template.id)} className="text-[9px] font-black text-primary uppercase">+ Add Unit</button>
                          </div>
                          <div className="grid gap-3">
                            {units.map((unit: any) => (
                              <div key={unit.id} className="bg-white p-4 rounded-xl border flex justify-between items-center group/unit">
                                <div className="flex gap-6 items-center">
                                  <div onClick={() => openUnitModal(unit)} className="px-3 py-1 bg-slate-900 text-white rounded font-mono text-sm cursor-pointer hover:bg-primary transition-colors">{unit.plate_number}</div>
                                  <div className="flex gap-4 text-xs font-bold text-slate-500">
                                    <span className="flex items-center gap-1"><Gauge size={14}/>{unit.mileage} KM</span>
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor:unit.color}}/>{unit.color}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase", unit.availability_status === 'available' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600')}>{unit.availability_status}</span>
                                  <div className="flex gap-1">
                                    <button onClick={() => openMaintenance(unit)} className="p-1.5 hover:bg-primary/10 rounded text-slate-400 hover:text-primary transition-colors"><Wrench size={14}/></button>
                                    <button className="p-1.5 hover:bg-primary/10 rounded text-slate-400 hover:text-primary transition-colors"><History size={14}/></button>
                                    <button onClick={() => handleDeleteUnit(unit.id)} className="p-1.5 hover:bg-rose-500/10 rounded text-rose-500 transition-colors"><Trash2 size={14}/></button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>      {isModalOpen && editingTemplate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-[40%] bg-slate-50 p-10 border-r">
              <h3 className="text-xl font-black uppercase mb-6">Vehicle Image</h3>
              <div className="aspect-[4/3] relative rounded-3xl overflow-hidden border-2 border-dashed bg-white flex items-center justify-center group shadow-inner">
                {(editingTemplate.image_url || editingTemplate.default_thumbnail) ? (
                  <>
                    <Image src={editingTemplate.image_url || editingTemplate.default_thumbnail} alt="Preview" fill className="object-cover" />
                    <div className="absolute top-4 right-4 flex items-center justify-center">
                      <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-xl hover:bg-white transition-all text-primary border border-primary/10">
                        <Upload size={20}/>
                      </button>
                    </div>
                  </>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 text-slate-400"><Upload size={24}/><span className="text-xs font-bold uppercase">Upload</span></button>
                )}
                {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>
            <div className="flex-1 p-12 space-y-6">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Model Config</h2>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={editingTemplate.brand || ''} onChange={e => setEditingTemplate({...editingTemplate, brand: e.target.value})} className="p-4 bg-slate-50 border rounded-xl font-bold" placeholder="Brand" />
                <input type="text" value={editingTemplate.model || ''} onChange={e => setEditingTemplate({...editingTemplate, model: e.target.value})} className="p-4 bg-slate-50 border rounded-xl font-bold" placeholder="Model" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <select value={editingTemplate.category || ''} onChange={e => setEditingTemplate({...editingTemplate, category: e.target.value})} className="p-4 bg-slate-50 border rounded-xl font-bold"><option>Economy</option><option>Sedan</option><option>SUV</option><option>MPV</option><option>Luxury</option><option>Hatchback</option></select>
                <select value={editingTemplate.transmission || ''} onChange={e => setEditingTemplate({...editingTemplate, transmission: e.target.value})} className="p-4 bg-slate-50 border rounded-xl font-bold"><option>Automatic</option><option>Manual</option></select>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={editingTemplate.seats ?? 5} onChange={e => setEditingTemplate({...editingTemplate, seats: parseInt(e.target.value)})} className="p-4 bg-slate-50 border rounded-xl font-bold" placeholder="Seats" />
                  <input type="number" step="0.1" min="0" max="5" value={editingTemplate.rating ?? 5.0} onChange={e => setEditingTemplate({...editingTemplate, rating: parseFloat(e.target.value)})} className="p-4 bg-slate-50 border rounded-xl font-bold text-amber-500" placeholder="Rating" />
                </div>
              </div>
              <textarea value={editingTemplate.description || ""} onChange={e => setEditingTemplate({...editingTemplate, description: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl min-h-[100px]" placeholder="Description" />
              
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vehicle Experiences (Tags)</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'family', label: 'Family & 7-Seaters' },
                    { id: 'honeymoon', label: 'Honeymoon Premium' },
                    { id: 'sporty', label: 'Sporty & Dynamic' },
                    { id: 'luxury', label: 'Luxury Executive' },
                    { id: 'economy', label: 'Daily Commute' }
                  ].map((tag) => {
                    const isSelected = editingTemplate.tags?.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          const currentTags = editingTemplate.tags || [];
                          const newTags = isSelected
                            ? currentTags.filter((t: string) => t !== tag.id)
                            : [...currentTags, tag.id];
                          setEditingTemplate({ ...editingTemplate, tags: newTags });
                        }}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
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

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Technical Specifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={editingTemplate.air_conditioning ?? true} onChange={e => setEditingTemplate({...editingTemplate, air_conditioning: e.target.checked})} className="w-4 h-4 text-primary rounded" />
                    <span className="text-[10px] font-bold uppercase">Air Con</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={editingTemplate.has_hifi ?? true} onChange={e => setEditingTemplate({...editingTemplate, has_hifi: e.target.checked})} className="w-4 h-4 text-primary rounded" />
                    <span className="text-[10px] font-bold uppercase">HiFi Audio</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={editingTemplate.has_bluetooth ?? true} onChange={e => setEditingTemplate({...editingTemplate, has_bluetooth: e.target.checked})} className="w-4 h-4 text-primary rounded" />
                    <span className="text-[10px] font-bold uppercase">Bluetooth</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={editingTemplate.has_apple_carplay ?? false} onChange={e => setEditingTemplate({...editingTemplate, has_apple_carplay: e.target.checked})} className="w-4 h-4 text-primary rounded" />
                    <span className="text-[10px] font-bold uppercase">CarPlay</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={editingTemplate.has_android_auto ?? false} onChange={e => setEditingTemplate({...editingTemplate, has_android_auto: e.target.checked})} className="w-4 h-4 text-primary rounded" />
                    <span className="text-[10px] font-bold uppercase">Android Auto</span>
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Airbags:</span>
                    <input type="number" value={editingTemplate.airbag_count ?? 2} onChange={e => setEditingTemplate({...editingTemplate, airbag_count: parseInt(e.target.value)})} className="w-full bg-transparent font-bold text-xs focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 cursor-pointer"><input type="checkbox" checked={editingTemplate.published_status === 'published'} onChange={e => setEditingTemplate({...editingTemplate, published_status: e.target.checked ? 'published' : 'draft'})} /> Visible</label>
                <button onClick={handleSaveTemplate} className="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-primary/20">Save Model</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isUnitModalOpen && editingUnit && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsUnitModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[2rem] shadow-2xl p-10">
            <h3 className="text-2xl font-black uppercase mb-6">Unit Configuration</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <input type="text" value={editingUnit.plate_number || ''} onChange={e => setEditingUnit({...editingUnit, plate_number: e.target.value})} className="p-4 bg-slate-50 border rounded-xl font-bold uppercase" placeholder="Plate Number" />
              <input type="text" value={editingUnit.vin || ""} onChange={e => setEditingUnit({...editingUnit, vin: e.target.value})} className="p-4 bg-slate-50 border rounded-xl font-bold" placeholder="VIN" />
              <input type="text" value={editingUnit.color || ''} onChange={e => setEditingUnit({...editingUnit, color: e.target.value})} className="p-4 bg-slate-50 border rounded-xl font-bold" placeholder="Color" />
              <input type="number" value={editingUnit.mileage ?? 0} onChange={e => setEditingUnit({...editingUnit, mileage: parseInt(e.target.value)})} className="p-4 bg-slate-50 border rounded-xl font-bold" placeholder="Mileage" />
              <select value={editingUnit.availability_status || 'available'} onChange={e => setEditingUnit({...editingUnit, availability_status: e.target.value})} className="p-4 bg-slate-50 border rounded-xl font-bold col-span-2"><option value="available">Available</option><option value="maintenance">Maintenance</option><option value="rented">Rented</option></select>
            </div>
            <button onClick={handleSaveUnit} className="w-full py-4 bg-admin-text text-white rounded-xl font-black uppercase text-sm">Save Unit</button>
          </div>
        </div>
      )}

      {isMaintModalOpen && selectedUnitForMaint && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSavingMaint && setIsMaintModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-10 text-center animate-in zoom-in-95">
             <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6 shadow-sm"><Wrench size={32} /></div>
             <h3 className="text-xl font-black uppercase mb-2">Record Maintenance</h3>
             <p className="text-slate-500 text-sm mb-6 font-medium">Record entry for <span className="font-bold text-admin-text">{selectedUnitForMaint.plate_number}</span></p>
             <input 
               type="text" 
               placeholder="Service (e.g. Oil Change)" 
               className="w-full p-4 bg-slate-50 border rounded-xl font-bold text-sm mb-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
               value={maintDescription}
               onChange={(e) => setMaintDescription(e.target.value)}
               disabled={isSavingMaint}
             />
             <button 
               onClick={handleLogMaintenance}
               disabled={isSavingMaint || !maintDescription}
               className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
             >
               {isSavingMaint ? <Loader2 className="animate-spin" size={16} /> : "Log Service"}
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";