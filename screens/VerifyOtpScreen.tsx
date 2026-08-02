import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { SIZES, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
// @ts-ignore - AppContext is still a plain JS module
import { useAppContext, api } from '../context/AppContext';
import { validateOtp, sanitizeDigits } from '../utils/validation';

type VerifyOtpScreenProps = {
  route?: {
    params?: {
      email?: string;
    };
  };
  navigation: {
    replace: (screen: string, params?: Record<string, unknown>) => void;
    [key: string]: any;
  };
};

export default function VerifyOtpScreen({ route, navigation }: VerifyOtpScreenProps) {
  const { colors } = useTheme();
  const style = makeStyles(colors);

  const email = route?.params?.email ?? '';
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const { signIn } = useAppContext();

  const errorFrom = (err: any, fallback: string) =>
    err.response?.data?.error || err.response?.data?.message || fallback;

  const handleVerify = async (): Promise<void> => {
    const codeError = validateOtp(code);
    if (codeError) {
      Alert.alert('Check the code', codeError);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, code: code.trim() });
      if (data.token) {
        // Verified — signing in swaps the navigator to the app stack automatically.
        await signIn(data.token, data.email, data.name || 'User');
      } else {
        Alert.alert('Already verified', 'Your account is verified. Please sign in.', [
          { text: 'OK', onPress: () => navigation.replace('Login', { autoEmail: email }) },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Verification failed', errorFrom(err, 'That code is invalid or has expired'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (): Promise<void> => {
    setResending(true);
    try {
      const { data } = await api.post('/auth/resend-otp', { email });
      setCode('');
      Alert.alert('Code sent', data.message || 'A new code is on its way.');
    } catch (err: any) {
      Alert.alert('Could not resend', errorFrom(err, 'Try again shortly.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={style.container}>
      <Text style={style.logoText}>Verify Your Email</Text>
      <Text style={style.subTitle}>
        We sent a 6-digit code to{'\n'}
        <Text style={style.emailText}>{email}</Text>
      </Text>

      <View style={style.inputContainer}>
        <TextInput
          style={style.codeInput}
          placeholder="000000"
          placeholderTextColor={colors.textSecondary}
          value={code}
          onChangeText={(val) => setCode(sanitizeDigits(val, 6))}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
        />

        <TouchableOpacity style={style.button} onPress={handleVerify} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.textMain} /> : <Text style={style.buttonText}>Verify</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={style.toggleLink} onPress={handleResend} disabled={resending}>
          <Text style={style.toggleText}>{resending ? 'Sending...' : "Didn't get it? Resend code"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={style.forgotLink} onPress={() => navigation.replace('Login')}>
          <Text style={style.forgotText}>Back to Sign In</Text>
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
    logoText: { fontSize: 30, fontWeight: 'bold', color: c.primary, marginBottom: 8 },
    subTitle: {
      fontSize: 14,
      color: c.textSecondary,
      marginBottom: 40,
      textAlign: 'center',
      lineHeight: 20,
    },
    emailText: { color: c.textMain, fontWeight: '600' },
    inputContainer: { width: '100%', maxWidth: 320 },
    codeInput: {
      backgroundColor: c.surface,
      color: c.textMain,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: SIZES.radius,
      fontSize: 28,
      letterSpacing: 10,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.border,
      fontWeight: '700',
    },
    button: {
      backgroundColor: c.primary,
      paddingVertical: 14,
      borderRadius: SIZES.radius,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: { color: c.textMain, fontSize: 16, fontWeight: '600' },
    toggleLink: { marginTop: 20, alignItems: 'center' },
    toggleText: { color: c.primary, fontSize: 14, fontWeight: '500' },
    forgotLink: { marginTop: 14, alignItems: 'center' },
    forgotText: { color: c.textSecondary, fontSize: 13, fontWeight: '500' },
  });