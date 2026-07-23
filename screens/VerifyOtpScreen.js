import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../theme';
import { useAppContext, api } from '../context/AppContext';

export default function VerifyOtpScreen({ route, navigation }) {
  const email = route?.params?.email ?? '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { signIn } = useAppContext();

  const errorFrom = (err, fallback) =>
    err.response?.data?.error || err.response?.data?.message || fallback;

  const handleVerify = async () => {
    if (code.trim().length !== 6) {
      Alert.alert('Invalid code', 'Enter the 6-digit code from your email.');
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
    } catch (err) {
      Alert.alert('Verification failed', errorFrom(err, 'That code is invalid or has expired'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const { data } = await api.post('/auth/resend-otp', { email });
      Alert.alert('Code sent', data.message || 'A new code is on its way.');
    } catch (err) {
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
          placeholderTextColor={COLORS.textSecondary}
          value={code}
          onChangeText={(val) => setCode(val.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
        />

        <TouchableOpacity style={style.button} onPress={handleVerify} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.textMain} /> : <Text style={style.buttonText}>Verify</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={style.toggleLink} onPress={handleResend} disabled={resending}>
          <Text style={style.toggleText}>
            {resending ? 'Sending…' : "Didn't get it? Resend code"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={style.forgotLink} onPress={() => navigation.replace('Login')}>
          <Text style={style.forgotText}>Back to Sign In</Text>
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
  logoText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailText: {
    color: COLORS.textMain,
    fontWeight: '600',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 320,
  },
  codeInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.textMain,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    fontSize: 28,
    letterSpacing: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontWeight: '700',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: '600',
  },
  toggleLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  forgotLink: {
    marginTop: 14,
    alignItems: 'center',
  },
  forgotText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
});