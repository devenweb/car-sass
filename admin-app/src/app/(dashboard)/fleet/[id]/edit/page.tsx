"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { VehicleTemplateForm } from "@/components/fleet/VehicleTemplateForm";

export default function EditFleetCarPage() {
  const { id } = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchTemplate = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicle_templates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setTemplate(data);
    } catch (error) {
      console.error(error);
      alert("Error fetching model details");
      router.push('/fleet');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) fetchTemplate();
  }, [id, fetchTemplate]);

  const handleSave = async () => {
    if (!template.brand || !template.model) return;
    setUploading(true);
    
    try {
      const { error } = await supabase
        .from('vehicle_templates')
        .update({
          brand: template.brand,
          model: template.model,
          category: template.category,
          transmission: template.transmission,
          seats: template.seats,
          description: template.description,
          default_thumbnail: template.default_thumbnail,
          published_status: template.published_status,
          rating: template.rating,
          air_conditioning: template.air_conditioning,
          has_hifi: template.has_hifi,
          has_bluetooth: template.has_bluetooth,
          has_apple_carplay: template.has_apple_carplay,
          has_android_auto: template.has_android_auto,
          airbag_count: template.airbag_count,
          fuel_type: template.fuel_type,
          luggage_large: template.luggage_large,
          luggage_small: template.luggage_small,
          doors: template.doors,
          engine_size: template.engine_size,
          tags: template.tags,
          marketing_strikethrough_price: template.marketing_strikethrough_price,
          fixed_discount_amount: template.fixed_discount_amount,
          percentage_discount_rate: template.percentage_discount_rate,
          long_term_threshold_days: template.long_term_threshold_days,
          long_term_discount_percent: template.long_term_discount_percent
        })
        .eq('id', id);

      if (error) throw error;
      router.push('/fleet');
    } catch (error: any) {
      console.error("Save error:", error);
      alert("Error saving model: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `templates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('car-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('car-assets')
        .getPublicUrl(filePath);
          
      setTemplate({ ...template, default_thumbnail: publicUrl });
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Configuration...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <VehicleTemplateForm 
        template={template}
        setTemplate={setTemplate}
        onSave={handleSave}
        uploading={uploading}
        handleImageUpload={handleImageUpload}
      />
    </div>
  );
}
