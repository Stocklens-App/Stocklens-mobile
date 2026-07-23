import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme';
import { useAppContext, api } from '../context/AppContext';
import { validatePassword } from '../utils/validation';

export default function AccountSettingsScreen({ navigation }) {
  const { token, signOut } = useAppContext();

  // Read-only profile details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoadingProfile(false);
      return;
    }
    api
      .get('/api/users/profile')
      .then(({ data }) => {
        setName(data.name || '');
        setEmail(data.email || '');
        setLoadingProfile(false);
      })
      .catch((err) => {
        console.error('Account Settings load error:', err.message);
        setLoadingProfile(false);
      });
  }, [token]);

  const errorFrom = (err, fallback) =>
    err.response?.data?.error || err.response?.data?.message || fallback;

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Check your details', 'Enter your current password.');
      return;
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      Alert.alert('Check your details', passwordError);
      return;
    }
    if (!confirmPassword.trim()) {
      Alert.alert('Check your details', 'Please confirm your new password.');
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      Alert.alert('Check your details', 'New password and confirmation do not match.');
      return;
    }
    if (newPassword.trim() === currentPassword.trim()) {
      Alert.alert('Check your details', 'Your new password must be different from the current one.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/api/users/password', {
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Your password has been changed.');
    } catch (err) {
      Alert.alert('Password change failed', errorFrom(err, 'Failed to change password'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await api.delete('/api/users/profile');
              // Clearing the token returns us to the signed-out stack automatically.
              await signOut();
            } catch (err) {
              Alert.alert('Delete failed', errorFrom(err, 'Failed to delete account'));
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loadingProfile) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary || '#3478F6'} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.primary || '#3478F6'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Info — read only */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PROFILE INFO</Text>

          <Text style={styles.label}>Name</Text>
          <Text style={styles.readOnlyValue}>{name || '—'}</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.readOnlyValue}>{email || '—'}</Text>

          <Text style={styles.helperText}>
            Your name and email can't be changed here. Contact support if they need updating.
          </Text>
        </View>

        {/* Change Password */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CHANGE PASSWORD</Text>

          <Text style={styles.label}>Current Password</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textSecondary || '#7E8494'}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={64}
          />

          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textSecondary || '#7E8494'}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={64}
          />

          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textSecondary || '#7E8494'}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={64}
          />

          <TouchableOpacity
            style={[styles.primaryButton, savingPassword && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={savingPassword}
          >
            {savingPassword ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Delete Account */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>DANGER ZONE</Text>
          <Text style={styles.dangerText}>
            Deleting your account is permanent and cannot be undone.
          </Text>
          <TouchableOpacity
            style={[styles.deleteButton, deleting && styles.buttonDisabled]}
            onPress={handleDeleteAccount}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background || '#11141A' },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: SIZES.padding || 16,
    paddingBottom: 16,
  },
  backBtn: { width: 22 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain || '#FFF' },
  scrollContent: { paddingHorizontal: SIZES.padding || 16, paddingBottom: 40 },

  card: {
    backgroundColor: COLORS.surface || '#1C212D',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border || '#2A3245',
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {
    color: COLORS.textSecondary || '#7E8494',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 14,
  },
  label: { color: COLORS.textSecondary || '#7E8494', fontSize: 12, marginBottom: 6, marginTop: 10 },
  readOnlyValue: {
    color: COLORS.textMain || '#FFF',
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 4,
  },
  helperText: {
    color: COLORS.textSecondary || '#7E8494',
    fontSize: 12,
    marginTop: 16,
    lineHeight: 17,
  },
  input: {
    backgroundColor: COLORS.background || '#11141A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border || '#2A3245',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textMain || '#FFF',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: COLORS.primary || '#3478F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },

  dangerText: {
    color: COLORS.textSecondary || '#7E8494',
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  deleteButton: {
    backgroundColor: COLORS.error || '#E74C3C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});