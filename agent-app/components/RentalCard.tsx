import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, User, ChevronRight } from 'lucide-react-native';

interface RentalCardProps {
  rental: any;
  onPress: () => void;
  type: 'delivery' | 'collection';
}

export default function RentalCard({ rental, onPress, type }: RentalCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.carName}>{rental.cars?.name || 'Unknown Car'}</Text>
        <View style={[styles.badge, type === 'delivery' ? styles.deliveryBadge : styles.collectionBadge]}>
          <Text style={styles.badgeText}>{type.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <User size={16} color="#64748B" />
          <Text style={styles.detailText}>{rental.customers?.name || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#64748B" />
          <Text style={styles.detailText}>
            {type === 'delivery' ? rental.start_date : rental.end_date}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={16} color="#64748B" />
          <Text style={styles.detailText}>Agency Hub</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.statusText}>Status: {rental.status}</Text>
        <ChevronRight size={20} color="#0D9488" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deliveryBadge: {
    backgroundColor: '#CCFBF1',
  },
  collectionBadge: {
    backgroundColor: '#FEF9C3',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0D9488',
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    color: '#64748B',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'capitalize',
  },
});
