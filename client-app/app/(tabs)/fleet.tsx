import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal, Star, Filter } from 'lucide-react-native';
import { Colors, Spacing, Shadows } from '@/constants/Theme';
import { useCars } from '@/hooks/useCars';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function FleetScreen() {
  const { cars, loading } = useCars();
  const params = useLocalSearchParams();
  const [search, setSearch] = useState((params.q as string) || '');
  const router = useRouter();

  useEffect(() => {
    if (params.q) {
      setSearch(params.q as string);
    }
  }, [params.q]);

  const filteredCars = cars.filter(car => 
    car.name.toLowerCase().includes(search.toLowerCase()) ||
    car.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Our <Text style={{ color: Colors.primary }}>Fleet</Text></Text>
        <TouchableOpacity style={styles.filterButton}>
          <SlidersHorizontal size={20} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={Colors.textMuted} />
          <TextInput
            placeholder="Search by model or category..."
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={Colors.textMuted}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredCars}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.carCard}
              onPress={() => router.push({ pathname: '/car/[id]', params: { id: item.id } })}
            >
              <Image source={{ uri: item.image_url }} style={styles.carImage} />
              <View style={styles.cardInfo}>
                <Text style={styles.carName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.ratingRow}>
                  <Star size={10} color={Colors.accent} fill={Colors.accent} />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.categoryText}>• {item.category}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceValue}>Rs {item.price_per_day.toLocaleString()}</Text>
                  <Text style={styles.pricePeriod}>/day</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No vehicles found matching your search.</Text>
            </View>
          }
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.secondary,
    letterSpacing: -1,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: 14,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.secondary,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  carCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  carImage: {
    width: '100%',
    height: 120,
  },
  cardInfo: {
    padding: Spacing.sm,
  },
  carName: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.secondary,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginLeft: 2,
  },
  categoryText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginLeft: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primary,
  },
  pricePeriod: {
    fontSize: 10,
    color: Colors.textMuted,
    marginLeft: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
