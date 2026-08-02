import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import { SIZES, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useAppContext, api } from '../context/AppContext';
import { validateEmail } from '../utils/validation';
import type { RootStackParamList } from '../navigation/types';

type FieldName = 'email' | 'password';
type Props = StackScreenProps<RootStackParamList, 'Login'>;

interface LoginResponse {
  token: string;
  email: string;
  name: string;
  message?: string;
}

export default function LoginScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const style = makeStyles(colors);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldName[]>([]);
  const { signIn } = useAppContext();

  const handleLogin = async (): Promise<void> => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors(['email']);
      Alert.alert('Check your details', emailError);
      return;
    }
    if (!password.trim()) {
      setErrors(['password']);
      Alert.alert('Check your details', 'Password is required.');
      return;
    }
    setErrors([]);
    setLoading(true);
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      const { token, email: userEmail, name } = response.data;
      if (!token) {
        Alert.alert('Login Failed', 'The server did not return a session. Please try again.');
        return;
      }
      await signIn(token, userEmail, name || 'User');
    } catch (error: any) {
      const resData = error.response?.data;
      const message =
        resData?.error ||
        resData?.message ||
        (typeof resData === 'string' ? resData : null) ||
        'Server error';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route.params?.autoEmail) {
      setEmail(route.params.autoEmail);
    }
    if (route.params?.autoPassword) {
      setPassword(route.params.autoPassword);
    }
  }, [route.params]);

  return (
    <View style={style.container}>
      <View style={style.logoBox}>
        <Ionicons name="trending-up" size={26} color={colors.primary} />
      </View>
      <Text style={style.logoText}>StockLens</Text>
      <Text style={style.subTitle}>Track stock, sales, and profits in real-time</Text>

      <View style={style.inputContainer}>
        <View style={[style.inputWrapper, errors.includes('email') && style.errorInput]}>
          <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={style.leadingIcon} />
          <TextInput
            style={style.input}
            placeholder="Email Address"
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
          />
        </View>

        <View style={[style.inputWrapper, errors.includes('password') && style.errorInput]}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={style.leadingIcon} />
          <TextInput
            style={style.input}
            placeholder="Password"
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
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={style.eyeIcon}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={style.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={style.buttonText}>Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={style.forgotLink} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={style.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={style.toggleLink} onPress={() => navigation.navigate('Register')}>
          <Text style={style.toggleText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SIZES.padding,
    },
    logoBox: {
      width: 52,
      height: 52,
      borderRadius: SIZES.radius + 6,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    logoText: { fontSize: 36, fontWeight: 'bold', color: c.primary, marginBottom: 8 },
    subTitle: { fontSize: 14, color: c.textSecondary, marginBottom: 40, textAlign: 'center' },
    inputContainer: { width: '100%', maxWidth: 320 },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: SIZES.radius,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    leadingIcon: { marginRight: 8 },
    input: {
      flex: 1,
      color: c.textMain,
      paddingVertical: 14,
      fontSize: 16,
    },
    errorInput: { borderColor: c.error },
    eyeIcon: { paddingLeft: 8 },
    button: {
      backgroundColor: c.primary,
      paddingVertical: 14,
      borderRadius: SIZES.radius,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    toggleLink: { marginTop: 20, alignItems: 'center' },
    toggleText: { color: c.primary, fontSize: 14, fontWeight: '500' },
    forgotLink: { marginTop: 14, alignItems: 'center' },
    forgotText: { color: c.textSecondary, fontSize: 13, fontWeight: '500' },
  });