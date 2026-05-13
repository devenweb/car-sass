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
  const [gallery, setGallery] = useState<string[]>([]);

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
    if (id) {
      fetchTemplate();
      fetchGallery();
    }
  }, [id, fetchTemplate]);

  async function fetchGallery() {
    const { data } = await supabase
      .from('vehicle_template_images')
      .select('image_url')
      .eq('vehicle_template_id', id)
      .order('sort_order', { ascending: true });
    
    if (data) setGallery(data.map((img: any) => img.image_url));
  }

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
          long_term_discount_percent: template.long_term_discount_percent,
          daily_price: template.daily_price,
          slug: template.slug,
          features_json: template.features_json
        })
        .eq('id', id);

      if (error) throw error;

      // Update Gallery
      // 1. Delete existing gallery records for this template
      await supabase.from('vehicle_template_images').delete().eq('vehicle_template_id', id);
      
      // 2. Insert new gallery records
      if (gallery.length > 0) {
        const galleryRecords = gallery.map((url, index) => ({
          vehicle_template_id: id,
          image_url: url,
          sort_order: index
        }));
        await supabase.from('vehicle_template_images').insert(galleryRecords);
      }

      router.push('/fleet');
    } catch (error: any) {
      console.error("Save error:", error);
      alert("Error saving model: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
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
        
        uploadedUrls.push(publicUrl);
        if (!isGallery) break; // Only upload first for hero
      }
          
      if (isGallery) {
        setGallery([...gallery, ...uploadedUrls]);
      } else {
        setTemplate({ ...template, default_thumbnail: uploadedUrls[0] });
      }
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
        gallery={gallery}
        setGallery={setGallery}
      />
    </div>
  );
}
