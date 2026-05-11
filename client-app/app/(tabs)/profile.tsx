import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, CreditCard, Shield, HelpCircle, LogOut, ChevronRight, Crown } from 'lucide-react-native';
import { Colors, Spacing, Shadows } from '@/constants/Theme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/');
    }
  }

  const MenuLink = ({ icon: Icon, title, subtitle, onPress, color = Colors.secondary }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '10' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <ChevronRight size={18} color={Colors.border} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Account</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={20} color={Colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }} 
              style={styles.avatar} 
            />
            <View style={styles.badgeContainer}>
              <Crown size={12} color={Colors.white} />
            </View>
          </View>
          <Text style={styles.userName}>{user?.email?.split('@')[0].toUpperCase() || 'VALUED CUSTOMER'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'member@royalcarrental.mu'}</Text>
          <View style={styles.membershipBadge}>
            <Text style={styles.membershipText}>ROYAL PLATINUM MEMBER</Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Personal</Text>
          <View style={styles.menuCard}>
            <MenuLink icon={User} title="Profile Details" subtitle="Edit your information" />
            <MenuLink icon={CreditCard} title="Payment Methods" subtitle="Manage your cards" />
            <MenuLink icon={Shield} title="Privacy & Security" subtitle="Passwords and 2FA" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Support</Text>
          <View style={styles.menuCard}>
            <MenuLink icon={HelpCircle} title="Help Center" subtitle="FAQ and contact support" />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Royal Rentals Mobile v1.0.0</Text>
          <Text style={styles.legalText}>Terms of Service • Privacy Policy</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: 32,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#F8FAFC',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  membershipBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  membershipText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.secondary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: '#FFF1F2',
    borderRadius: 20,
    gap: 10,
  },
  logoutText: {
    color: Colors.error,
    fontWeight: '900',
    fontSize: 15,
    textTransform: 'uppercase',
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  legalText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
