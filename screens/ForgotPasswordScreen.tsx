import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme';
// @ts-ignore - AppContext is still a plain JS module
import { api } from '../context/AppContext';
import { validateEmail, validateOtp, validatePassword, sanitizeDigits } from '../utils/validation';

interface ForgotPasswordScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
    replace: (screen: string, params?: any) => void;
    [key: string]: any;
  };
}

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  // step 1 = enter email, step 2 = code + new password
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const errorFrom = (err: any, fallback: string) =>
    err.response?.data?.error || err.response?.data?.message || fallback;

  const handleSendCode = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      Alert.alert('Check your details', emailError);
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      // The server answers the same way whether or not the account exists,
      // so we always move to step 2.
      Alert.alert(
        'Check your email',
        'If an account exists for that address, a 6-digit reset code has been sent.'
      );
      setStep(2);
    } catch (err: any) {
      Alert.alert('Error', errorFrom(err, 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const codeError = validateOtp(code);
    if (codeError) {
      Alert.alert('Check the code', codeError);
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
      Alert.alert('Check your details', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        newPassword: newPassword.trim(),
      });

      Alert.alert('Success', 'Your password has been reset. Please sign in.', [
        {
          text: 'OK',
          onPress: () => navigation.replace('Login', { autoEmail: email.trim().toLowerCase() }),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Reset failed', errorFrom(err, 'That code is invalid or has expired'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={style.container}>
      <TouchableOpacity style={style.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
      </TouchableOpacity>

      <Text style={style.logoText}>Reset Password</Text>
      <Text style={style.subTitle}>
        {step === 1
          ? "Enter the email address linked to your account and we'll send you a code."
          : 'Enter the code we emailed you, then choose a new password.'}
      </Text>

      <View style={style.inputContainer}>
        {step === 1 ? (
          <>
            <TextInput
              style={style.input}
              placeholder="Email Address"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={(val) => setEmail(val.replace(/\s/g, ''))}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={254}
            />

            <TouchableOpacity style={style.button} onPress={handleSendCode} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.textMain} />
              ) : (
                <Text style={style.buttonText}>Send Code</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={style.codeInput}
              placeholder="000000"
              placeholderTextColor={COLORS.textSecondary}
              value={code}
              onChangeText={(val) => setCode(sanitizeDigits(val, 6))}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
            />

            <View style={style.passwordWrapper}>
              <TextInput
                style={style.passwordInput}
                placeholder="New Password"
                placeholderTextColor={COLORS.textSecondary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={64}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={style.eyeIcon}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={style.passwordWrapper}>
              <TextInput
                style={style.passwordInput}
                placeholder="Confirm New Password"
                placeholderTextColor={COLORS.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={64}
              />
            </View>

            <TouchableOpacity style={style.button} onPress={handleResetPassword} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.textMain} />
              ) : (
                <Text style={style.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={style.toggleLink} onPress={handleSendCode} disabled={loading}>
              <Text style={style.toggleText}>Resend code</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={style.toggleLink} onPress={() => navigation.navigate('Login')}>
          <Text style={style.toggleText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: SIZES.padding,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  inputContainer: { width: '100%', maxWidth: 320 },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.textMain,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  codeInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.textMain,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    fontSize: 26,
    letterSpacing: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontWeight: '700',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    color: COLORS.textMain,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeIcon: { paddingRight: 16 },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: COLORS.textMain, fontSize: 16, fontWeight: '600' },
  toggleLink: { marginTop: 20, alignItems: 'center' },
  toggleText: { color: COLORS.primary, fontSize: 14, fontWeight: '500' },
});