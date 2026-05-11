import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, Calendar, Star, ChevronRight, Bell, Heart } from 'lucide-react-native';
import { Colors, Spacing, Shadows } from '@/constants/Theme';
import { useCars } from '@/hooks/useCars';
import { useRouter } from 'expo-router';
import BookingWizard from '@/components/BookingWizard';

export default function HomeScreen() {
  const { cars, loading } = useCars();
  const router = useRouter();

  const featuredCars = cars.filter(car => car.rating >= 4.8).slice(0, 5);

  const categories = [
    { id: '1', name: 'Luxury', icon: '💎' },
    { id: '2', name: 'SUV', icon: '🚙' },
    { id: '3', name: 'Sedan', icon: '🚗' },
    { id: '4', name: 'Sport', icon: '🏎️' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero Section with Yellow Background */}
        <View style={styles.heroSection}>
          <SafeAreaView edges={['top']}>
            <View style={styles.heroContent}>
              <Text style={styles.heroUpperText}>THE SMARTER WAY TO RENT A CAR</Text>
              <Text style={styles.heroTitle}>MAURITIUS CAR RENTAL</Text>
              <Text style={styles.heroSubtitle}>
                Hundreds of vehicles ready. Transparent pricing. Airport pickup available. Drive the island freely.
              </Text>
            </View>
          </SafeAreaView>
        </View>

        {/* Booking Wizard (Floating Over Hero) */}
        <BookingWizard />

        <View style={{ height: 20 }} />

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.categoryCard}>
                <Text style={styles.categoryIcon}>{item.icon}</Text>
                <Text style={styles.categoryName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
          />
        </View>

        {/* Featured Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Luxury</Text>
            <TouchableOpacity onPress={() => router.push('/fleet')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={featuredCars}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.carCard}
                onPress={() => router.push({ pathname: '/car/[id]', params: { id: item.id } })}
              >
                <Image source={{ uri: item.image_url }} style={styles.carImage} />
                <TouchableOpacity style={styles.heartButton}>
                  <Heart size={18} color={Colors.white} />
                </TouchableOpacity>
                <View style={styles.carInfo}>
                  <Text style={styles.carName}>{item.name}</Text>
                  <View style={styles.ratingRow}>
                    <Star size={12} color={Colors.accent} fill={Colors.accent} />
                    <Text style={styles.ratingText}>{item.rating} • {item.category}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceValue}>Rs {item.price_per_day.toLocaleString()}</Text>
                    <Text style={styles.pricePeriod}>/day</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
          />
        </View>

        {/* Special Offer / Banner */}
        <View style={styles.bannerContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000' }} 
            style={styles.bannerImage} 
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTag}>Limited Time</Text>
            <Text style={styles.bannerTitle}>Summer Luxury Experience</Text>
            <Text style={styles.bannerSubtitle}>Get 15% off on weekly rentals</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroSection: {
    backgroundColor: Colors.brandYellow,
    paddingBottom: 60,
  },
  heroContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  heroUpperText: {
    fontSize: 12,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.6)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#000000',
    lineHeight: 52,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(0,0,0,0.7)',
    lineHeight: 24,
    maxWidth: '90%',
  },
  section: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.secondary,
    letterSpacing: -0.5,
  },
  viewAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  categoryCard: {
    width: 90,
    height: 100,
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  carCard: {
    width: 280,
    backgroundColor: Colors.white,
    borderRadius: 28,
    marginRight: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  carImage: {
    width: '100%',
    height: 180,
  },
  heartButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carInfo: {
    padding: Spacing.md,
  },
  carName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.secondary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 4,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
  pricePeriod: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 2,
  },
  bannerContainer: {
    marginHorizontal: Spacing.lg,
    height: 200,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.lg,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  bannerTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: '900',
    color: Colors.white,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.white,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: 16,
  },
  bannerButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bannerButtonText: {
    color: Colors.secondary,
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
  },
});
