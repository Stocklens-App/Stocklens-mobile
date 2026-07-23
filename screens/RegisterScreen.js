import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme'; // 👈 Clean import from your shared theme
import { api } from '../context/AppContext';
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  sanitizeName,
  sanitizeDigits,
} from '../utils/validation';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // 👁️ Separate visibility toggles for each password field
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateFields = () => {
    // Checked in field order so the first message matches the first bad field.
    const checks = [
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

  const handleRegister = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: name.trim().replace(/\s+/g, ' '),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        phoneNumber: phoneNumber.trim(),
      });

      // Nothing is saved yet — the account is created once the code is confirmed.
      navigation.navigate('VerifyOtp', { email: email.trim().toLowerCase() });
    } catch (error) {
      console.log('🔴 Backend Raw Error Payload:', error.response?.data);

      if (error.response) {
        const resData = error.response.data;
        const errorMessage =
          resData?.error ||
          resData?.message ||
          (typeof resData === 'string' ? resData : null) ||
          'Registration failed. Please try again.';

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
    <View style={style.container}>
      <Text style={style.logoText}>Create Account</Text>
      <Text style={style.subTitle}>Join StockLens to manage your operations</Text>

      <View style={style.inputContainer}>
        {/* Full Name — digits and symbols are filtered out as you type */}
        <TextInput
          style={[style.input, errors.includes('name') && style.errorInput]}
          placeholder="Full Name"
          placeholderTextColor={COLORS.textSecondary}
          value={name}
          onChangeText={(val) => {
            setName(sanitizeName(val));
            setErrors(errors.filter((e) => e !== 'name'));
          }}
          maxLength={50}
        />

        {/* Email Address */}
        <TextInput
          style={[style.input, errors.includes('email') && style.errorInput]}
          placeholder="Email Address"
          placeholderTextColor={COLORS.textSecondary}
          value={email}
          onChangeText={(val) => {
            setEmail(val.replace(/\s/g, ''));
            setErrors(errors.filter((e) => e !== 'email'));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={254}
        />

        {/* Phone Number — digits only, capped at 10 */}
        <TextInput
          style={[style.input, errors.includes('phone') && style.errorInput]}
          placeholder="Phone Number (e.g. 0245173765)"
          placeholderTextColor={COLORS.textSecondary}
          value={phoneNumber}
          onChangeText={(val) => {
            setPhoneNumber(sanitizeDigits(val, 10));
            setErrors(errors.filter((e) => e !== 'phone'));
          }}
          keyboardType="phone-pad"
          maxLength={10}
        />

        {/* 👁️ Password Input Wrapper */}
        <View style={[style.passwordWrapper, errors.includes('password') && style.errorInput]}>
          <TextInput
            style={style.passwordInput}
            placeholder="Password"
            placeholderTextColor={COLORS.textSecondary}
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              setErrors(errors.filter((e) => e !== 'password'));
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={64}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={style.eyeIcon}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 👁️ Confirm Password Input Wrapper */}
        <View style={[style.passwordWrapper, errors.includes('confirm') && style.errorInput]}>
          <TextInput
            style={style.passwordInput}
            placeholder="Confirm Password"
            placeholderTextColor={COLORS.textSecondary}
            value={confirmPassword}
            onChangeText={(val) => {
              setConfirmPassword(val);
              setErrors(errors.filter((e) => e !== 'confirm'));
            }}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={64}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={style.eyeIcon}>
            <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={style.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.textMain} /> : <Text style={style.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={style.toggleLink} onPress={() => navigation.navigate('Login')}>
          <Text style={style.toggleText}>Already have an account? Sign In</Text>
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
  logoText: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 },
  subTitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 40, textAlign: 'center' },
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
  errorInput: { borderColor: COLORS.error },
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