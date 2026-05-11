import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Switch } from 'react-native';
import { MapPin, Calendar, Clock, ArrowRight, Check, X } from 'lucide-react-native';
import { Colors, Spacing, Shadows } from '@/constants/Theme';
import { useRouter } from 'expo-router';

export default function BookingWizard() {
  const [location, setLocation] = useState('Sir Seewoosagur Ramgoolam International Airport (SSR)');
  const [returnSame, setReturnSame] = useState(true);
  const router = useRouter();

  const handleSearch = () => {
    // Navigate to fleet with search params
    router.push({
      pathname: '/fleet',
      params: { 
        q: location,
        pickup: '2026-05-15', // Mock dates for now
        dropoff: '2026-05-18' 
      }
    });
  };

  return (
    <View style={styles.card}>
      {/* Pick-up Location */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Pick-up location</Text>
        <View style={styles.inputWrapper}>
          <MapPin size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter pick-up location"
          />
          {location.length > 0 && (
            <TouchableOpacity onPress={() => setLocation('')}>
              <X size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Same Location Checkbox */}
      <TouchableOpacity 
        style={styles.checkboxRow} 
        onPress={() => setReturnSame(!returnSame)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, returnSame && styles.checkboxActive]}>
          {returnSame && <Check size={14} color={Colors.white} strokeWidth={4} />}
        </View>
        <Text style={styles.checkboxLabel}>Return car in same location</Text>
      </TouchableOpacity>

      {/* Date & Time Row */}
      <View style={styles.row}>
        <View style={[styles.fieldGroup, { flex: 1.2, marginRight: 8 }]}>
          <Text style={styles.label}>Pick-up date</Text>
          <TouchableOpacity style={styles.smallInputWrapper}>
            <Text style={styles.placeholderText}>•— Select date</Text>
            <Calendar size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Pick-up time</Text>
          <TouchableOpacity style={styles.smallInputWrapper}>
            <Text style={styles.inputText}>10:00 AM</Text>
            <Clock size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldGroup, { flex: 1.2, marginRight: 8 }]}>
          <Text style={styles.label}>Drop-off date</Text>
          <TouchableOpacity style={styles.smallInputWrapper}>
            <Text style={styles.placeholderText}>•— Select date</Text>
            <Calendar size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>Drop-off time</Text>
          <TouchableOpacity style={styles.smallInputWrapper}>
            <Text style={styles.inputText}>10:00 AM</Text>
            <Clock size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer Info & Search Button */}
      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>✓ Free cancellation</Text>
          <Text style={styles.infoDot}> • </Text>
          <Text style={styles.infoText}>✓ No hidden fees</Text>
          <Text style={styles.infoDot}> • </Text>
          <Text style={styles.infoText}>✓ Instant confirmation</Text>
        </View>
        
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search now</Text>
          <ArrowRight size={18} color={Colors.white} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: Spacing.lg,
    marginTop: -40, // Pull up over the yellow background
    ...Shadows.lg,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: Colors.accent,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  placeholderText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  inputText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
  },
  footer: {
    marginTop: 10,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  infoText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  infoDot: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  searchButton: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    minWidth: 160,
  },
  searchButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
