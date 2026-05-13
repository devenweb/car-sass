"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { VehicleTemplateForm } from "@/components/fleet/VehicleTemplateForm";

export default function NewFleetCarPage() {
  const router = useRouter();
  const [template, setTemplate] = useState<any>({
    brand: "", 
    model: "", 
    category: "Economy",
    transmission: "Automatic", 
    seats: 5, 
    description: "",
    published_status: "published",
    marketing_strikethrough_price: null,
    fixed_discount_amount: 0,
    percentage_discount_rate: 0,
    long_term_threshold_days: 5,
    long_term_discount_percent: 10,
    tags: [],
    features_json: [],
    daily_price: 1500,
    slug: ""
  });
  const [uploading, setUploading] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);

  const handleSave = async () => {
    if (!template.brand || !template.model) {
      alert("Brand and Model are required");
      return;
    }
    setUploading(true);
    
    try {
       const { data, error } = await supabase
        .from('vehicle_templates')
        .insert([template])
        .select()
        .single();

      if (error) throw error;

      // Save Gallery
      if (gallery.length > 0 && data) {
        const galleryRecords = gallery.map((url, index) => ({
          vehicle_template_id: data.id,
          image_url: url,
          sort_order: index
        }));
        await supabase.from('vehicle_template_images').insert(galleryRecords);
      }

      router.push('/fleet');
    } catch (error: any) {
      console.error("Save error:", error);
      alert("Error creating model: " + error.message);
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
        if (!isGallery) break;
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
        isNew={true}
      />
    </div>
  );
}
