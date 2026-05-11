import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Camera, CheckCircle2, ChevronLeft, Trash2, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { uploadInspectionPhoto } from '../lib/storage';

export default function InspectionScreen() {
  const { rentalId, type } = useLocalSearchParams();
  const router = useRouter();
  const signatureRef = useRef<SignatureViewRef>(null);
  
  const [rental, setRental] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [fuelLevel, setFuelLevel] = useState('100');
  const [mileage, setMileage] = useState('');
  const [notes, setNotes] = useState('');
  const [localPhotos, setLocalPhotos] = useState<string[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);

  useEffect(() => {
    fetchRentalDetails();
  }, [rentalId]);

  async function fetchRentalDetails() {
    const { data, error } = await supabase
      .from('rentals')
      .select('*, cars(*), customers(*)')
      .eq('id', rentalId)
      .single();

    if (error) {
      Alert.alert('Error', 'Could not fetch rental details');
      router.back();
    } else {
      setRental(data);
      setLoading(false);
    }
  }

  async function pickImage() {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setLocalPhotos([...localPhotos, result.assets[0].uri]);
    }
  }

  function removePhoto(index: number) {
    const newPhotos = [...localPhotos];
    newPhotos.splice(index, 1);
    setLocalPhotos(newPhotos);
  }

  const handleSignature = (signature: string) => {
    setSignature(signature);
    setShowSignature(false);
  };

  const handleClearSignature = () => {
    setSignature(null);
  };

  async function handleSubmit() {
    if (!mileage) {
      Alert.alert('Validation', 'Please enter the current mileage');
      return;
    }

    if (!signature) {
      Alert.alert('Validation', 'Customer signature is required');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Upload photos to Supabase Storage
      const uploadedPhotoUrls = await Promise.all(
        localPhotos.map(uri => uploadInspectionPhoto(uri, rentalId as string, type as string))
      );

      // 2. Save inspection record
      const { error: inspectionError } = await supabase
        .from('rental_inspections')
        .insert({
          rental_id: rentalId,
          agent_id: user?.id,
          type: type,
          fuel_level: parseInt(fuelLevel),
          mileage: parseInt(mileage),
          condition_notes: notes,
          photos: uploadedPhotoUrls,
          customer_signature: signature, // Saving base64 for now, can be optimized later
          status: 'completed'
        });

      if (inspectionError) throw inspectionError;

      // 3. Update rental status
      const nextStatus = type === 'delivery' ? 'delivered' : 'collected';
      const { error: rentalUpdateError } = await supabase
        .from('rentals')
        .update({ status: nextStatus })
        .eq('id', rentalId);

      if (rentalUpdateError) throw rentalUpdateError;

      // 4. Update car status
      const nextCarStatus = type === 'delivery' ? 'rented' : 'available';
      await supabase
        .from('cars')
        .update({ status: nextCarStatus })
        .eq('id', rental.car_id);

      Alert.alert('Success', `${type === 'delivery' ? 'Delivery' : 'Collection'} completed successfully!`);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Submission error:', error);
      Alert.alert('Error', error.message || 'An error occurred during submission');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  if (showSignature) {
    return (
      <View style={styles.signatureContainer}>
        <View style={styles.signatureHeader}>
          <Text style={styles.signatureTitle}>Customer Signature</Text>
          <TouchableOpacity onPress={() => setShowSignature(false)}>
            <X size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>
        <SignatureScreen
          ref={signatureRef}
          onOK={handleSignature}
          descriptionText="Sign here to confirm vehicle condition"
          clearText="Clear"
          confirmText="Save"
          webStyle={`.m-signature-pad--footer {display: none; margin: 0;}`}
        />
        <View style={styles.signatureFooter}>
          <TouchableOpacity style={styles.clearBtn} onPress={() => signatureRef.current?.clearSignature()}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={() => signatureRef.current?.readSignature()}>
            <Text style={styles.saveBtnText}>Confirm Signature</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>{type === 'delivery' ? 'Delivery' : 'Collection'} Inspection</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Car Details</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Vehicle</Text>
          <Text style={styles.infoValue}>{rental?.cars?.name || 'N/A'}</Text>
          <Text style={[styles.infoLabel, { marginTop: 10 }]}>Customer</Text>
          <Text style={styles.infoValue}>{rental?.customers?.name || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inspection Data</Text>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.inputLabel}>Fuel Level (%)</Text>
            <TextInput
              style={styles.input}
              value={fuelLevel}
              onChangeText={setFuelLevel}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Mileage (km)</Text>
            <TextInput
              style={styles.input}
              value={mileage}
              onChangeText={setMileage}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>Condition Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          placeholder="Note any scratches, dents, or interior issues..."
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Condition Photos</Text>
        <View style={styles.photoGrid}>
          {localPhotos.map((uri, index) => (
            <View key={index} style={styles.photoWrapper}>
              <Image source={{ uri }} style={styles.photoThumb} />
              <TouchableOpacity style={styles.removePhotoBtn} onPress={() => removePhoto(index)}>
                <Trash2 size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addPhotoCard} onPress={pickImage}>
            <Camera size={32} color="#0D9488" />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Acknowledgment</Text>
        {signature ? (
          <View style={styles.signaturePreviewContainer}>
            <Image source={{ uri: signature }} style={styles.signaturePreview} resizeMode="contain" />
            <TouchableOpacity style={styles.reSignBtn} onPress={() => setShowSignature(true)}>
              <Text style={styles.reSignBtnText}>Re-sign</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.signaturePlaceholder} onPress={() => setShowSignature(true)}>
            <Text style={styles.signaturePlaceholderText}>Tap to Capture Customer Signature</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, (submitting || !signature) && styles.disabledButton]} 
        onPress={handleSubmit}
        disabled={submitting || !signature}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <CheckCircle2 size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.submitButtonText}>Complete {type === 'delivery' ? 'Delivery' : 'Collection'}</Text>
          </>
        )}
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 12,
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  row: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  photoWrapper: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 5,
  },
  photoThumb: {
    flex: 1,
    borderRadius: 8,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
  addPhotoCard: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    margin: 5,
  },
  addPhotoText: {
    fontSize: 10,
    color: '#0D9488',
    marginTop: 5,
    fontWeight: 'bold',
  },
  signaturePlaceholder: {
    height: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signaturePlaceholderText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  signaturePreviewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  signaturePreview: {
    width: '100%',
    height: 120,
  },
  reSignBtn: {
    marginTop: 10,
    padding: 8,
  },
  reSignBtnText: {
    color: '#0D9488',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#0D9488',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signatureContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  signatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  signatureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  signatureFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
  },
  clearBtn: {
    flex: 1,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  clearBtnText: {
    color: '#64748B',
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    padding: 15,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
