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
    tags: []
  });
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    if (!template.brand || !template.model) {
      alert("Brand and Model are required");
      return;
    }
    setUploading(true);
    
    try {
      const { error } = await supabase
        .from('vehicle_templates')
        .insert([template]);

      if (error) throw error;
      router.push('/fleet');
    } catch (error: any) {
      console.error("Save error:", error);
      alert("Error creating model: " + error.message);
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <VehicleTemplateForm 
        template={template}
        setTemplate={setTemplate}
        onSave={handleSave}
        uploading={uploading}
        handleImageUpload={handleImageUpload}
        isNew={true}
      />
    </div>
  );
}
