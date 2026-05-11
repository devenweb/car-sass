import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Star, Users, Briefcase, Gauge, Zap, Heart, Calendar, CheckCircle2 } from 'lucide-react-native';
import { Colors, Spacing, Shadows } from '@/constants/Theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  async function fetchCarDetails() {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCar(data);
    } catch (err) {
      console.error('Error fetching car:', err);
      Alert.alert('Error', 'Vehicle details not found');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const SpecItem = ({ icon: Icon, label, value }: any) => (
    <View style={styles.specCard}>
      <Icon size={20} color={Colors.primary} />
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Top Image & Header (Gallery) */}
        <View style={styles.imageContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
          >
            {(car.gallery && car.gallery.length > 0 ? car.gallery : [car.image_url]).map((img: string, index: number) => (
              <Image key={index} source={{ uri: img }} style={styles.heroImage} />
            ))}
          </ScrollView>
          <SafeAreaView style={styles.overlayHeader} edges={['top']}>
            <TouchableOpacity onPress={() => router.back()} style={styles.circularButton}>
              <ChevronLeft size={24} color={Colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.circularButton}>
              <Heart size={24} color={isFavorite ? Colors.error : Colors.secondary} fill={isFavorite ? Colors.error : 'none'} />
            </TouchableOpacity>
          </SafeAreaView>
          {car.gallery && car.gallery.length > 1 && (
            <View style={styles.galleryIndicator}>
              <Text style={styles.galleryText}>1 / {car.gallery.length}</Text>
            </View>
          )}
        </View>

        <View style={styles.contentCard}>
          <View style={styles.dragHandle} />
          
          <View style={styles.mainInfo}>
            <View>
              <Text style={styles.categoryTag}>{car.category}</Text>
              <Text style={styles.carName}>{car.name}</Text>
              <View style={styles.ratingRow}>
                <Star size={16} color={Colors.accent} fill={Colors.accent} />
                <Text style={styles.ratingText}>{car.rating} <Text style={{ color: Colors.textMuted }}>(120+ Reviews)</Text></Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceValue}>Rs {car.price_per_day.toLocaleString()}</Text>
              <Text style={styles.pricePeriod}>per day</Text>
            </View>
          </View>

          <Text style={styles.description}>
            {car.description || `Experience the pinnacle of automotive engineering with the ${car.name}. This ${car.category} offers unparalleled comfort and performance, making it the perfect choice for your stay in Mauritius.`}
          </Text>

          {/* Specifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.specsRow}>
              <SpecItem icon={Users} label="Capacity" value={`${car.seats || 5} Seats`} />
              {car.specs && Object.entries(car.specs).map(([key, value]: [string, any]) => {
                let icon = Gauge;
                if (key === 'power') icon = Zap;
                if (key === 'luggage') icon = Briefcase;
                if (key === 'engine') icon = Gauge;
                
                return (
                  <SpecItem 
                    key={key} 
                    icon={icon} 
                    label={key.charAt(0).toUpperCase() + key.slice(1)} 
                    value={value} 
                  />
                );
              })}
            </ScrollView>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.featuresGrid}>
              {car.features && Object.entries(car.features).map(([key, value]: [string, any]) => (
                <View key={key} style={styles.featureItem}>
                  <CheckCircle2 size={16} color={Colors.primary} />
                  <Text style={styles.featureText}>{typeof value === 'boolean' ? key.toUpperCase() : value}</Text>
                </View>
              ))}
              {!car.features && ['GPS Navigation', 'Leather Seats', 'Bluetooth', 'Child Seat'].map((feature) => (
                <View key={feature} style={styles.featureItem}>
                  <CheckCircle2 size={16} color={Colors.primary} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalLabel}>Total for 3 days</Text>
          <Text style={styles.totalValue}>Rs {(car.price_per_day * 3).toLocaleString()}</Text>
        </View>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => Alert.alert('Premium Booking', 'Our reservation system is being finalized for mobile payments.')}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 350,
    position: 'relative',
  },
  heroImage: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  galleryIndicator: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  galleryText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  overlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  circularButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  contentCard: {
    flex: 1,
    backgroundColor: Colors.background,
    marginTop: -40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: Spacing.lg,
    paddingTop: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  carName: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.secondary,
    letterSpacing: -0.5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
    marginLeft: 6,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  pricePeriod: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textMuted,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.secondary,
    marginBottom: Spacing.md,
  },
  specsRow: {
    gap: Spacing.md,
    paddingRight: Spacing.lg,
  },
  specCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    width: 100,
    ...Shadows.sm,
  },
  specLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 8,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  specValue: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.secondary,
    marginTop: 2,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    ...Shadows.lg,
  },
  totalPriceContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.secondary,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 20,
    ...Shadows.md,
  },
  bookButtonText: {
    color: Colors.white,
    fontWeight: '900',
    fontSize: 16,
    textTransform: 'uppercase',
  },
});
