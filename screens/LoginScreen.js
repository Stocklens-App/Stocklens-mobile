import React, { useState, useEffect } from 'react';
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
import { COLORS, SIZES } from '../theme';
import api from '../context/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ route, navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleLogin = async () => {
    let newErrors = [];
    if (!email) newErrors.push('email');
    if (!password) newErrors.push('password');

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', {
        email: email.trim(),
        password: password
      });

      const { token, name } = response.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userName', name);

      console.log("LOGIN SUCCESS - TOKEN SAVED");

      
if (onLoginSuccess) {
  onLoginSuccess();
}
    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data || error.message);
      Alert.alert('Login Failed', 'Invalid credentials or server error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route?.params?.autoEmail && route?.params?.autoPassword) {
      setEmail(route.params.autoEmail);
      setPassword(route.params.autoPassword);
    }
  }, [route?.params]);

  return (
    <View style={style.container}>
      <Text style={style.logoText}>StockLens</Text>

      <Text style={style.subTitle}>
        Track stock, sales, and profits in real-time
      </Text>

      <View style={style.inputContainer}>

        <TextInput
          style={[style.input, errors.includes('email') && style.errorInput]}
          placeholder="Email Address"
          placeholderTextColor={COLORS.textSecondary}
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            setErrors(errors.filter(e => e !== 'email'));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={[style.passwordWrapper, errors.includes('password') && style.errorInput]}>
          <TextInput
            style={style.passwordInput}
            placeholder="Password"
            placeholderTextColor={COLORS.textSecondary}
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              setErrors(errors.filter(e => e !== 'password'));
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={style.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={style.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={COLORS.textMain} />
            : <Text style={style.buttonText}>Sign In</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={style.toggleText}>
            Don't have an account? Sign Up
          </Text>
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
    fontSize: 36,
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
  }
});