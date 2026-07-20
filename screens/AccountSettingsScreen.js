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
import { useAppContext } from '../context/AppContext';
import { IP_ADDRESS } from '../context/AppContext';

export default function AccountSettingsScreen({ navigation }) {
  const { currentUserEmail, setCurrentUserEmail } = useAppContext();

  // Profile fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!currentUserEmail) {
      setLoadingProfile(false);
      return;
    }
    fetch(`http://${IP_ADDRESS}:8081/api/users/profile?email=${encodeURIComponent(currentUserEmail)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setName(data.name || '');
        setEmail(data.email || '');
        setLoadingProfile(false);
      })
      .catch((err) => {
        console.error('Account Settings load error:', err.message);
        setLoadingProfile(false);
      });
  }, [currentUserEmail]);

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Missing info', 'Name and email cannot be empty.');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch(`http://${IP_ADDRESS}:8081/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentEmail: currentUserEmail, name, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data === 'string' ? data : 'Failed to update profile');
      }
      // Email may have changed — keep context in sync
      setCurrentUserEmail(email);
      Alert.alert('Success', 'Your profile has been updated.');
    } catch (err) {
      Alert.alert('Update failed', err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing info', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`http://${IP_ADDRESS}:8081/api/users/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUserEmail, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data === 'string' ? data : 'Failed to change password');
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Your password has been changed.');
    } catch (err) {
      Alert.alert('Password change failed', err.message);
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
              const res = await fetch(
                `http://${IP_ADDRESS}:8081/api/users/profile?email=${encodeURIComponent(currentUserEmail)}`,
                { method: 'DELETE' }
              );
              const data = await res.json();
              if (!res.ok) {
                throw new Error(typeof data === 'string' ? data : 'Failed to delete account');
              }
              setCurrentUserEmail(null);
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } catch (err) {
              Alert.alert('Delete failed', err.message);
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
        {/* Profile Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PROFILE INFO</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={COLORS.textSecondary || '#7E8494'}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.textSecondary || '#7E8494'}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TouchableOpacity
            style={[styles.primaryButton, savingProfile && styles.buttonDisabled]}
            onPress={handleSaveProfile}
            disabled={savingProfile}
          >
            {savingProfile ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
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
          />

          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textSecondary || '#7E8494'}
            secureTextEntry
          />

          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textSecondary || '#7E8494'}
            secureTextEntry
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

  dangerText: { color: COLORS.textSecondary || '#7E8494', fontSize: 13, marginBottom: 16, lineHeight: 18 },
  deleteButton: {
    backgroundColor: COLORS.error || '#E74C3C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});