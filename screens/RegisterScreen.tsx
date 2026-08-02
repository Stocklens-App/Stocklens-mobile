import React, { useState, useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { api } from '../context/AppContext';
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  sanitizeName,
  sanitizeDigits,
} from '../utils/validation';

type FieldName = 'name' | 'email' | 'password' | 'phone' | 'confirm';

type RegisterScreenProps = {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { colors } = useTheme();
  const style = makeStyles(colors);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldName[]>([]);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const validateFields = (): boolean => {
    const checks: [FieldName, string | null][] = [
      ['name', validateName(name)],
      ['email', validateEmail(email)],
      ['phone', validatePhone(phoneNumber)],
      ['password', validatePassword(password)],
    ];
    for (const [field, message] of checks) {
      if (message) {
        setErrors([field]);
        Alert.alert('Check your details', message);
        return false;
      }
    }
    if (!confirmPassword.trim()) {
      setErrors(['confirm']);
      Alert.alert('Check your details', 'Please confirm your password.');
      return false;
    }
    if (password.trim() !== confirmPassword.trim()) {
      setErrors(['confirm']);
      Alert.alert('Check your details', 'Passwords do not match.');
      return false;
    }
    setErrors([]);
    return true;
  };

  const handleRegister = async (): Promise<void> => {
    if (!validateFields()) return;
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: name.trim().replace(/\s+/g, ' '),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      navigation.navigate('VerifyOtp', { email: email.trim().toLowerCase() });
    } catch (error: any) {
      console.log('Backend Raw Error Payload:', error.response?.data);
      if (error.response) {
        const resData = error.response.data;
        const errorMessage =
          resData?.error ||
          resData?.message ||
          (typeof resData === 'string' ? resData : null) ||
          resData?.errorMessage ||
          'Registration validation failed.';
        Alert.alert('Registration Failed', errorMessage);
      } else if (error.request) {
        Alert.alert('Network Error', 'Cannot reach backend server.');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={style.container}
        contentContainerStyle={style.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={style.title}>Create Account</Text>
        <Text style={style.subTitle}>
          Join StockLens to follow the GSE, learn, and practise investing.
        </Text>

        <View style={style.inputContainer}>
          <Text style={style.label}>FULL NAME</Text>
          <View style={[style.inputWrapper, errors.includes('name') && style.errorInput]}>
            <Ionicons name="person-outline" size={18} color={colors.textSecondary} style={style.leadingIcon} />
            <TextInput
              style={style.input}
              placeholder="Your full name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={(val) => {
                setName(sanitizeName(val));
                setErrors(errors.filter((e) => e !== 'name'));
              }}
              maxLength={50}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          <Text style={style.label}>EMAIL ADDRESS</Text>
          <View style={[style.inputWrapper, errors.includes('email') && style.errorInput]}>
            <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={style.leadingIcon} />
            <TextInput
              ref={emailRef}
              style={style.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={(val) => {
                setEmail(val.replace(/\s/g, ''));
                setErrors(errors.filter((e) => e !== 'email'));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={254}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          <Text style={style.label}>PHONE NUMBER</Text>
          <View style={[style.inputWrapper, errors.includes('phone') && style.errorInput]}>
            <Ionicons name="call-outline" size={18} color={colors.textSecondary} style={style.leadingIcon} />
            <TextInput
              ref={phoneRef}
              style={style.input}
              placeholder="0245173765"
              placeholderTextColor={colors.textSecondary}
              value={phoneNumber}
              onChangeText={(val) => {
                setPhoneNumber(sanitizeDigits(val, 10));
                setErrors(errors.filter((e) => e !== 'phone'));
              }}
              keyboardType="phone-pad"
              maxLength={10}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          <Text style={style.label}>PASSWORD</Text>
          <View style={[style.inputWrapper, errors.includes('password') && style.errorInput]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={style.leadingIcon} />
            <TextInput
              ref={passwordRef}
              style={style.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                setErrors(errors.filter((e) => e !== 'password'));
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={64}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              blurOnSubmit={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={style.eyeIcon}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={style.label}>CONFIRM PASSWORD</Text>
          <View style={[style.inputWrapper, errors.includes('confirm') && style.errorInput]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={style.leadingIcon} />
            <TextInput
              ref={confirmRef}
              style={style.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={(val) => {
                setConfirmPassword(val);
                setErrors(errors.filter((e) => e !== 'confirm'));
              }}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={64}
              returnKeyType="go"
              onSubmitEditing={handleRegister}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={style.eyeIcon}>
              <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={style.button} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={style.buttonText}>Create Account</Text>}
          </TouchableOpacity>

          <Text style={style.terms}>
            By continuing you agree to the Terms & Privacy Policy
          </Text>

          <TouchableOpacity style={style.toggleLink} onPress={() => navigation.navigate('Login')}>
            <Text style={style.toggleText}>Already have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign In</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scrollContent: { paddingHorizontal: 28, paddingTop: 72, paddingBottom: 40 },
    title: { fontSize: 30, fontWeight: '800', color: c.textMain, letterSpacing: -0.8 },
    subTitle: { fontSize: 14, color: c.textSecondary, marginTop: 8, marginBottom: 28, lineHeight: 20 },
    inputContainer: { width: '100%' },
    label: { fontSize: 11, fontWeight: '700', color: c.textSecondary, letterSpacing: 1, marginBottom: 8 },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 18,
      paddingHorizontal: 14,
    },
    leadingIcon: { marginRight: 8 },
    input: { flex: 1, color: c.textMain, paddingVertical: 15, fontSize: 15 },
    errorInput: { borderColor: c.error },
    eyeIcon: { paddingLeft: 8 },
    button: {
      backgroundColor: c.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 6,
    },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    terms: { fontSize: 11, color: c.textSecondary, textAlign: 'center', marginTop: 16, lineHeight: 16 },
    toggleLink: { marginTop: 20, alignItems: 'center' },
    toggleText: { color: c.textSecondary, fontSize: 14 },
  });