import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { SIZES } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { API_CONFIG } from '../context/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
const styles = createStyles(colors);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateFields = () => {
    let newErrors = [];

    if (!name) newErrors.push('name');
    if (!email) newErrors.push('email');
    if (!password) newErrors.push('password');
    if (!phoneNumber) newErrors.push('phone');
    if (!confirmPassword) newErrors.push('confirm');

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleRegister = async () => {
    if (!validateFields()) return;

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
     await axios.post(
  `${API_CONFIG.BASE_URL}/api/auth/register`,
  {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password,
    phoneNumber: phoneNumber.trim()
  }
);
await AsyncStorage.setItem('userName', name.trim());
await AsyncStorage.setItem('email', email.trim().toLowerCase());
await AsyncStorage.setItem('phone', phoneNumber.trim());

console.log("REGISTER SAVED PHONE:", phoneNumber.trim());
      navigation.navigate('Login', {
        autoEmail: email.trim().toLowerCase(),
        autoPassword: password
      });

    } catch (error) {
      console.log("Backend Error:", error.response?.data);

      if (error.response) {
        const resData = error.response.data;

        const message =
          typeof resData === 'string'
            ? resData
            : resData?.message ||
              resData?.error ||
              'Registration failed';

        Alert.alert('Registration Failed', message);
      } else {
        Alert.alert('Network Error', 'Cannot reach backend server.');
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>Create Account</Text>
      <Text style={styles.subTitle}>Join StockLens to manage your operations</Text>

      <View style={styles.inputContainer}>

        {/* Name */}
        <TextInput
          style={[styles.input, errors.includes('name') && styles.errorInput]}
          placeholder="Full Name"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={(val) => {
            setName(val);
            setErrors(errors.filter(e => e !== 'name'));
          }}
        />

        {/* Email */}
        <TextInput
          style={[styles.input, errors.includes('email') && styles.errorInput]}
          placeholder="Email Address"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            setErrors(errors.filter(e => e !== 'email'));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Phone */}
        <TextInput
          style={[styles.input, errors.includes('phone') && styles.errorInput]}
          placeholder="Phone Number"
          placeholderTextColor={colors.textSecondary}
          value={phoneNumber}
          onChangeText={(val) => {
            setPhoneNumber(val);
            setErrors(errors.filter(e => e !== 'phone'));
          }}
          keyboardType="phone-pad"
        />

        {/* Password */}
        <View style={[styles.passwordWrapper, errors.includes('password') && styles.errorInput]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              setErrors(errors.filter(e => e !== 'password'));
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <View style={[styles.passwordWrapper, errors.includes('confirm') && styles.errorInput]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm Password"
            placeholderTextColor={colors.textSecondary}
            value={confirmPassword}
            onChangeText={(val) => {
              setConfirmPassword(val);
              setErrors(errors.filter(e => e !== 'confirm'));
            }}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
            <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={colors.textMain} />
            : <Text style={styles.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        {/* Login link */}
        <TouchableOpacity
          style={styles.toggleLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.toggleText}>
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8
  },
  subTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 40,
    textAlign: 'center'
  },
  inputContainer: {
    width: '100%',
    maxWidth: 320
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.textMain,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  errorInput: {
    borderColor: colors.error
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16
  },
  passwordInput: {
    flex: 1,
    color: colors.textMain,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16
  },
  eyeIcon: {
    paddingRight: 16
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: colors.textMain,
    fontSize: 16,
    fontWeight: '600'
  },
  toggleLink: {
    marginTop: 20,
    alignItems: 'center'
  },
  toggleText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500'
  }
});