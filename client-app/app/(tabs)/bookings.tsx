import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Calendar, Car, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { Colors, Spacing, Shadows } from '@/constants/Theme';
import { supabase } from '@/lib/supabase';

export default function BookingsScreen() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRentals();
  }, []);

  async function fetchMyRentals() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // First find customer_id by email
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user.email)
        .single();

      if (customer) {
        const { data, error } = await supabase
          .from('rentals')
          .select('*, cars(*)')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRentals(data || []);
      }
    } catch (err) {
      console.error('Error fetching rentals:', err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return { label: 'Awaiting Confirmation', color: '#F59E0B', bg: '#FEF3C7', icon: Clock };
      case 'confirmed': return { label: 'Confirmed', color: '#3B82F6', bg: '#DBEAFE', icon: CheckCircle2 };
      case 'delivered': return { label: 'In Use', color: '#0D9488', bg: '#F0FDFA', icon: Car };
      case 'collected': return { label: 'Completed', color: '#10B981', bg: '#ECFDF5', icon: CheckCircle2 };
      case 'cancelled': return { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2', icon: AlertCircle };
      default: return { label: status, color: '#64748B', bg: '#F1F5F9', icon: Clock };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My <Text style={{ color: Colors.primary }}>Trips</Text></Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : rentals.length > 0 ? (
        <FlatList
          data={rentals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const status = getStatusConfig(item.status);
            const StatusIcon = status.icon;
            return (
              <TouchableOpacity style={styles.rentalCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <StatusIcon size={12} color={status.color} />
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                  <Text style={styles.dateText}>#{item.id.slice(0, 8).toUpperCase()}</Text>
                </View>

                <View style={styles.cardBody}>
                  <Image source={{ uri: item.cars?.image_url }} style={styles.carThumb} />
                  <View style={styles.rentalInfo}>
                    <Text style={styles.carName}>{item.cars?.name}</Text>
                    <View style={styles.detailRow}>
                      <Calendar size={12} color={Colors.textMuted} />
                      <Text style={styles.detailText}>{item.start_date} - {item.end_date}</Text>
                    </View>
                    <Text style={styles.priceText}>Rs {item.total_price?.toLocaleString()}</Text>
                  </View>
                  <ChevronRight size={20} color={Colors.border} />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Calendar size={48} color={Colors.border} />
          </View>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptySubtitle}>Your extraordinary journeys will appear here once you make a reservation.</Text>
          <TouchableOpacity style={styles.bookNowButton}>
            <Text style={styles.bookNowText}>Book Your First Ride</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.secondary,
    letterSpacing: -1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 20,
  },
  rentalCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.textMuted,
    fontWeight: '600',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carThumb: {
    width: 80,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  rentalInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  carName: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.secondary,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.secondary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  bookNowButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 18,
    ...Shadows.md,
  },
  bookNowText: {
    color: Colors.white,
    fontWeight: '900',
    fontSize: 14,
    textTransform: 'uppercase',
  },
});
