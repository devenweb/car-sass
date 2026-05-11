import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';

export async function uploadInspectionPhoto(uri: string, rentalId: string, type: string) {
  try {
    const fileName = `${rentalId}/${type}_${Date.now()}.jpg`;
    
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64', // Using string literal as a fallback if EncodingType is problematic
    });

    const { data, error } = await supabase.storage
      .from('rental-inspections')
      .upload(fileName, decode(base64), {
        contentType: 'image/jpeg',
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('rental-inspections')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}
