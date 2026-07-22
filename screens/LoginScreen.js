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
import { SIZES } from '../theme';
import { useTheme } from '../context/ThemeContext';
import api from '../context/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ route, navigation, onLoginSuccess }) {
  const { colors } = useTheme();
const style = createStyles(colors);
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
console.log("LOGIN RESPONSE:", response.data);
  const { token, name } = response.data;

if (!token) {
  throw new Error(response.data.error || "No token received");
}

await AsyncStorage.setItem('token', token);

if (name) {
  await AsyncStorage.setItem('userName', name);

  console.log("SAVED USER NAME:", name);

}
await AsyncStorage.setItem('email', email.trim());
console.log("SAVED EMAIL:", email.trim());

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
          placeholderTextColor={colors.textSecondary}
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
            placeholderTextColor={colors.textSecondary}
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
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={style.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={colors.textMain} />
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

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding
  },
  logoText: {
    fontSize: 36,
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