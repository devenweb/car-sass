import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import RentalCard from '../../components/RentalCard';
import { useRouter } from 'expo-router';

export default function DeliveriesScreen() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  async function fetchDeliveries() {
    setRefreshing(true);
    const { data, error } = await supabase
      .from('rentals')
      .select('*, cars(*), customers(*)')
      .in('status', ['pending', 'confirmed'])
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching deliveries:', error);
    } else {
      setRentals(data || []);
    }
    setRefreshing(false);
  }

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Deliveries</Text>
        <Text style={styles.subtitle}>Tasks for today</Text>
      </View>

      <FlatList
        data={rentals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RentalCard 
            rental={item} 
            type="delivery" 
            onPress={() => router.push({ pathname: '/inspection', params: { rentalId: item.id, type: 'delivery' } })}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchDeliveries} colors={['#0D9488']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No deliveries scheduled.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
  },
});
