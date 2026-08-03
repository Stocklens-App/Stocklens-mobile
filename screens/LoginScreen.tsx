import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Circle, Line, G, ClipPath, Defs } from 'react-native-svg';
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

// Compact StockLens logo mark (bars + magnifier), ink flips with theme.
const LogoMark = ({ ink }: { ink: string }) => (
  <Svg width={40} height={40} viewBox="0 0 1024 1024">
    <Defs>
      <ClipPath id="lc"><Circle cx={450} cy={477} r={158} /></ClipPath>
    </Defs>
    <Rect x={223} y={618} width={122} height={212} rx={18} fill="#A6D0F7" />
    <Rect x={375} y={525} width={122} height={305} rx={18} fill="#3478F6" />
    <Rect x={527} y={411} width={122} height={419} rx={18} fill="#A6D0F7" />
    <Rect x={679} y={300} width={122} height={530} rx={18} fill="#3478F6" />
    <G>
      <Line x1={578} y1={611} x2={787} y2={806} stroke={ink} strokeWidth={52} strokeLinecap="round" />
      <Circle cx={450} cy={477} r={181} fill="none" stroke={ink} strokeWidth={42} />
    </G>
  </Svg>
);

export default function LoginScreen({ route, navigation }: Props) {
  const { colors, isDark } = useTheme();
  const style = makeStyles(colors);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldName[]>([]);
  const { signIn } = useAppContext();

  const passwordRef = useRef<TextInput>(null);

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
    if (route.params?.autoEmail) setEmail(route.params.autoEmail);
    if (route.params?.autoPassword) setPassword(route.params.autoPassword);
  }, [route.params]);

  return (
    <KeyboardAvoidingView
      style={style.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={style.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={style.inner}>
          <View style={style.logoBox}>
            <LogoMark ink={isDark ? '#FFFFFF' : '#0F1B2D'} />
          </View>
          <Text style={style.wordmark}>
            Stock<Text style={{ color: colors.primary }}>Lens</Text>
          </Text>

          <View style={style.inputContainer}>
            <Text style={style.label}>EMAIL</Text>
            <View style={[style.inputWrapper, errors.includes('email') && style.errorInput]}>
              <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={style.leadingIcon} />
              <TextInput
                style={style.input}
                placeholder=""
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
                placeholder=""
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
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={style.eyeIcon}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={style.forgotLink} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={style.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={style.button} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={style.buttonText}>Sign In</Text>}
            </TouchableOpacity>

            <View style={style.dividerRow}>
              <View style={style.dividerLine} />
              <Text style={style.dividerText}>New to StockLens?</Text>
              <View style={style.dividerLine} />
            </View>

            <TouchableOpacity style={style.secondaryButton} onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
              <Text style={style.secondaryButtonText}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scrollContent: { flexGrow: 1, justifyContent: 'center' },
    inner: { paddingHorizontal: 28 },
    logoBox: {
      width: 60,
      height: 60,
      borderRadius: 16,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    wordmark: { fontSize: 34, fontWeight: '800', color: c.textMain, letterSpacing: -1, marginBottom: 32 },
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
    forgotLink: { alignSelf: 'flex-end', marginTop: -6, marginBottom: 18 },
    forgotText: { color: c.primary, fontSize: 13, fontWeight: '600' },
    button: {
      backgroundColor: c.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 22, gap: 12 },
    dividerLine: { flex: 1, height: 1, backgroundColor: c.border },
    dividerText: { fontSize: 12, color: c.textSecondary },
    secondaryButton: {
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
    },
    secondaryButtonText: { color: c.primary, fontSize: 15, fontWeight: '600' },
  });