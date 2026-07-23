import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme'; // 👈 Clean import from your shared theme
import { api } from '../context/AppContext';

type FieldName = 'name' | 'email' | 'password' | 'phone' | 'confirm';

// Lightweight navigation typing — enough to catch typos in screen names
// without requiring a full RootStackParamList setup right now.
type RegisterScreenProps = {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldName[]>([]);

  // 👁️ Separate visibility toggles for each password field
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const validateFields = (): boolean => {
    const newErrors: FieldName[] = [];
    if (!name) newErrors.push('name');
    if (!email) newErrors.push('email');
    if (!password) newErrors.push('password');
    if (!phoneNumber) newErrors.push('phone');
    if (!confirmPassword) newErrors.push('confirm');
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleRegister = async (): Promise<void> => {
    if (!validateFields()) return;
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        phoneNumber: phoneNumber.trim()
      });

      // Account created but unverified — go enter the emailed code.
      navigation.navigate('VerifyOtp', { email: email.trim().toLowerCase() });
    } catch (error: any) {
      console.log("🔴 Backend Raw Error Payload:", error.response?.data);

      if (error.response) {
        const resData = error.response.data;
        const errorMessage =
          (typeof resData === 'string' ? resData : null) ||
          resData?.error ||
          resData?.message ||
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
    <View style={style.container}>
      <Text style={style.logoText}>Create Account</Text>
      <Text style={style.subTitle}>Join StockLens to manage your operations</Text>

      <View style={style.inputContainer}>
        {/* Full Name */}
        <TextInput 
          style={[style.input, errors.includes('name') && style.errorInput]}
          placeholder="Full Name"
          placeholderTextColor={COLORS.textSecondary}
          value={name}
          onChangeText={(val) => { setName(val); setErrors(errors.filter(e => e !== 'name')); }}
        />

        {/* Email Address */}
        <TextInput 
          style={[style.input, errors.includes('email') && style.errorInput]}
          placeholder="Email Address"
          placeholderTextColor={COLORS.textSecondary}
          value={email}
          onChangeText={(val) => { setEmail(val); setErrors(errors.filter(e => e !== 'email')); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Phone Number */}
        <TextInput 
          style={[style.input, errors.includes('phone') && style.errorInput]}
          placeholder="Phone Number"
          placeholderTextColor={COLORS.textSecondary}
          value={phoneNumber}
          onChangeText={(val) => { setPhoneNumber(val); setErrors(errors.filter(e => e !== 'phone')); }}
          keyboardType="phone-pad"
        />

        {/* 👁️ Password Input Wrapper */}
        <View style={[style.passwordWrapper, errors.includes('password') && style.errorInput]}>
          <TextInput 
            style={style.passwordInput}
            placeholder="Password"
            placeholderTextColor={COLORS.textSecondary}
            value={password}
            onChangeText={(val) => { setPassword(val); setErrors(errors.filter(e => e !== 'password')); }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={style.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 👁️ Confirm Password Input Wrapper */}
        <View style={[style.passwordWrapper, errors.includes('confirm') && style.errorInput]}>
          <TextInput 
            style={style.passwordInput}
            placeholder="Confirm Password"
            placeholderTextColor={COLORS.textSecondary}
            value={confirmPassword}
            onChangeText={(val) => { setConfirmPassword(val); setErrors(errors.filter(e => e !== 'confirm')); }}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={style.eyeIcon}>
            <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={COLORS.textSecondary} />
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
    padding: SIZES.padding 
  },
  logoText: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: COLORS.primary, 
    marginBottom: 8 
  },
  subTitle: { 
    fontSize: 14, 
    color: COLORS.textSecondary, 
    marginBottom: 40, 
    textAlign: 'center' 
  },
  inputContainer: { 
    width: '100%', 
    maxWidth: 320 
  },
  input: { 
    backgroundColor: COLORS.surface, 
    color: COLORS.textMain, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    borderRadius: SIZES.radius, 
    fontSize: 16, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  errorInput: { 
    borderColor: COLORS.error 
  },
  passwordWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.surface, 
    borderRadius: SIZES.radius, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    marginBottom: 16 
  },
  passwordInput: { 
    flex: 1, 
    color: COLORS.textMain, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    fontSize: 16 
  },
  eyeIcon: { 
    paddingRight: 16 
  },
  button: { 
    backgroundColor: COLORS.primary, 
    paddingVertical: 14, 
    borderRadius: SIZES.radius, 
    alignItems: 'center', 
    marginTop: 10 
  },
  buttonText: { 
    color: COLORS.textMain, 
    fontSize: 16, 
    fontWeight: '600' 
  },
  toggleLink: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  toggleText: { 
    color: COLORS.primary, 
    fontSize: 14, 
    fontWeight: '500' 
  },
});