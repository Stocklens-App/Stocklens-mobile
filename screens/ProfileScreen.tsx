import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, ActivityIndicator, ScrollView, Image, Alert, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
// @ts-ignore - AppContext is still a plain JS module
import { useAppContext, api } from '../context/AppContext';

// Install-guarded: screen still works if expo-image-picker isn't installed.
let ImagePicker: typeof import('expo-image-picker') | null = null;
try {
  ImagePicker = require('expo-image-picker');
} catch {
  ImagePicker = null;
}

interface UserData {
  name?: string;
  email?: string;
  modulesCompleted?: number;
  streakDays?: number;
  portfolioValue?: number;
  portfolioReturnPct?: number;
}

type ProfileScreenProps = {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { colors, isDark, toggleTheme } = useTheme();
  const style = makeStyles(colors);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [photoSheetOpen, setPhotoSheetOpen] = useState<boolean>(false);
  const {
    token,
    notificationsEnabled,
    toggleNotifications,
    signOut,
    profilePhoto,
    updateProfilePhoto,
  } = useAppContext();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/api/users/profile')
      .then(({ data }: { data: UserData }) => {
        setUserData(data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error('Profile load error:', err.message);
        setLoading(false);
      });
  }, [token]);

  const hasPhoto = !!profilePhoto && profilePhoto.length > 0;

  const pickFromGallery = async () => {
    if (!ImagePicker) {
      Alert.alert('Not available', 'Run "npx expo install expo-image-picker" and reload to enable photos.');
      return;
    }
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Allow photo access to set a profile picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true,
      });
      if (!result.canceled && result.assets?.[0]?.base64) {
        const asset = result.assets[0];
        const mime = asset.mimeType || 'image/jpeg';
        const dataUri = `data:${mime};base64,${asset.base64}`;
        setUploadingPhoto(true);
        try {
          await updateProfilePhoto(dataUri);
        } catch {
          Alert.alert('Upload failed', 'Could not save your photo. Please try again.');
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch (err: any) {
      Alert.alert('Could not open photos', err.message);
    }
  };

  const removePhoto = async () => {
    setUploadingPhoto(true);
    try {
      await updateProfilePhoto(null);
    } catch {
      Alert.alert('Remove failed', 'Could not remove your photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const totalModules = 80;
  const progressPercent = userData?.modulesCompleted
    ? (userData.modulesCompleted / totalModules) * 100
    : 0;

  if (loading) {
    return (
      <View style={[style.container, style.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const initial = userData?.name ? userData.name[0].toUpperCase() : 'U';

  return (
    <View style={style.container}>
      <ScrollView contentContainerStyle={style.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Identity */}
        <View style={style.profileSection}>
          <TouchableOpacity style={style.avatarWrap} onPress={() => setPhotoSheetOpen(true)} activeOpacity={0.8} disabled={uploadingPhoto}>
            {hasPhoto ? (
              <Image source={{ uri: profilePhoto }} style={style.avatarImg} />
            ) : (
              <View style={style.avatar}>
                <Text style={style.avatarText}>{initial}</Text>
              </View>
            )}
            <View style={style.cameraBadge}>
              {uploadingPhoto
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : <Ionicons name="camera" size={14} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
          <Text style={style.name}>{userData?.name}</Text>
          <Text style={style.email}>{userData?.email}</Text>
        </View>

        {/* Learning Progress */}
        <View style={style.card}>
          <View style={style.cardHeaderRow}>
            <Text style={style.cardTitle}>LEARNING PROGRESS</Text>
            <Text style={style.metricMono}>{userData?.modulesCompleted ?? 0} / {totalModules}</Text>
          </View>
          <Text style={style.subTextLabel}>Modules completed</Text>
          <View style={style.progressBarTrack}>
            <View style={[style.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <View style={style.streakRow}>
            <View style={style.streakIconWrap}>
              <Ionicons name="flame" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={style.streakValue}>
                <Text style={style.mono}>{userData?.streakDays ?? 0}</Text> days
              </Text>
              <Text style={style.subTextLabel}>Current streak</Text>
            </View>
          </View>
        </View>

        {/* Portfolio Summary */}
        <View style={style.card}>
          <Text style={style.cardTitle}>PORTFOLIO VALUE</Text>
          <View style={style.portfolioRow}>
            <View>
              <Text style={style.portfolioValue}>GH₵ {(userData?.portfolioValue ?? 0).toFixed(2)}</Text>
              <Text style={style.portfolioReturn}>
                +{userData?.portfolioReturnPct ?? 0}% <Ionicons name="trending-up" size={13} color={colors.success} />
              </Text>
            </View>
            <Ionicons name="stats-chart" size={30} color={colors.textSecondary} />
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={style.actionRow} onPress={() => navigation.navigate('AccountSettings')} activeOpacity={0.7}>
          <View style={style.actionLeft}>
            <Ionicons name="settings-outline" size={20} color={colors.primary} />
            <Text style={style.actionText}>Account Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={style.actionRow} onPress={() => navigation.navigate('MyPortfolio')} activeOpacity={0.7}>
          <View style={style.actionLeft}>
            <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
            <Text style={style.actionText}>My Portfolio</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={style.actionRow}>
          <View style={style.actionLeft}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.primary} />
            <Text style={style.actionText}>Dark Mode</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#B8C2D0', true: colors.primary }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        <View style={style.actionRow}>
          <View style={style.actionLeft}>
            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            <Text style={style.actionText}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#B8C2D0', true: colors.primary }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        <TouchableOpacity style={style.logoutButton} onPress={signOut} activeOpacity={0.8}>
          <Text style={style.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Photo options bottom sheet */}
      <Modal visible={photoSheetOpen} transparent animationType="slide" onRequestClose={() => setPhotoSheetOpen(false)}>
        <Pressable style={style.sheetOverlay} onPress={() => setPhotoSheetOpen(false)}>
          <Pressable style={style.sheet}>
            <View style={style.sheetHandle} />
            <Text style={style.sheetTitle}>Profile Photo</Text>

            <TouchableOpacity
              style={style.sheetRow}
              onPress={() => { setPhotoSheetOpen(false); pickFromGallery(); }}
              activeOpacity={0.7}
            >
              <Ionicons name="image-outline" size={22} color={colors.primary} />
              <Text style={style.sheetRowText}>{hasPhoto ? 'Change photo' : 'Choose from gallery'}</Text>
            </TouchableOpacity>

            {hasPhoto && (
              <TouchableOpacity
                style={style.sheetRow}
                onPress={() => { setPhotoSheetOpen(false); removePhoto(); }}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={22} color={colors.error} />
                <Text style={[style.sheetRowText, { color: colors.error }]}>Remove photo</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[style.sheetRow, style.sheetCancel]}
              onPress={() => setPhotoSheetOpen(false)}
              activeOpacity={0.7}
            >
              <Text style={style.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    center: { justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingHorizontal: SIZES.padding, paddingBottom: 40 },
    profileSection: { alignItems: 'center', marginVertical: 24 },
    avatarWrap: { marginBottom: 16 },
    avatar: {
      width: 100, height: 100, borderRadius: 50,
      backgroundColor: c.primary, justifyContent: 'center', alignItems: 'center',
    },
    avatarImg: { width: 100, height: 100, borderRadius: 50, backgroundColor: c.surface },
    avatarText: { color: '#FFFFFF', fontSize: 44, fontWeight: 'bold' },
    cameraBadge: {
      position: 'absolute', right: 2, bottom: 2,
      width: 30, height: 30, borderRadius: 15,
      backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center',
      borderWidth: 3, borderColor: c.background,
    },
    name: { color: c.textMain, fontSize: 24, fontWeight: 'bold' },
    email: { color: c.textSecondary, fontSize: 14, marginTop: 2 },
    card: {
      backgroundColor: c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.border,
      padding: 18, marginBottom: 16,
    },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { color: c.textSecondary, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
    metricMono: { color: c.textMain, fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
    mono: { fontVariant: ['tabular-nums'] },
    subTextLabel: { color: c.textSecondary, fontSize: 12, marginTop: 2 },
    progressBarTrack: { height: 6, backgroundColor: c.border, borderRadius: 3, marginVertical: 12 },
    progressBarFill: { height: 6, backgroundColor: c.primary, borderRadius: 3 },
    streakRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
    streakIconWrap: {
      width: 38, height: 38, borderRadius: 19, backgroundColor: c.background,
      alignItems: 'center', justifyContent: 'center',
    },
    streakValue: { color: c.textMain, fontSize: 16, fontWeight: 'bold' },
    portfolioRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    portfolioValue: { color: c.textMain, fontSize: 26, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
    portfolioReturn: { color: c.success, fontSize: 14, fontWeight: '600', marginTop: 4 },
    actionRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.border,
      padding: 16, marginBottom: 12,
    },
    actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    actionText: { color: c.textMain, fontSize: 15, fontWeight: '500' },
    logoutButton: { backgroundColor: c.error, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 20 },
    logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: c.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 32,
    },
    sheetHandle: {
      width: 40, height: 4, borderRadius: 2,
      backgroundColor: c.border, alignSelf: 'center', marginBottom: 16,
    },
    sheetTitle: { color: c.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
    sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
    sheetRowText: { color: c.textMain, fontSize: 16, fontWeight: '500' },
    sheetCancel: { justifyContent: 'center', marginTop: 8, borderTopWidth: 1, borderTopColor: c.border },
    sheetCancelText: { color: c.textSecondary, fontSize: 16, fontWeight: '600' },
  });