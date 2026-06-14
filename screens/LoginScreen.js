import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function LoginScreen({ route, navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);

  const IP_ADDRESS = '192.168.100.189'; 
  

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
      const response = await axios.post(`http://${IP_ADDRESS}:8081/auth/login`, {
        email: email.trim(),
        password: password
      });
      
      const welcomeMessage = response.data;
      const nameOnly = welcomeMessage.split(', ')[1] || 'User';
      
      // 🚀 Pass the name to our Tab Navigator cleanly
      navigation.replace('MainTabs', { userName: nameOnly });
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data || 'Server error');
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
      <Text style={style.subTitle}>Track stock, sales, and profits in real-time</Text>

      <View style={style.inputContainer}>
        <TextInput 
          style={[style.input, errors.includes('email') && style.errorInput]}
          placeholder="Email Address"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={(val) => { setEmail(val); setErrors(errors.filter(e => e !== 'email')); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={[style.passwordWrapper, errors.includes('password') && style.errorInput]}>
          <TextInput 
            style={style.passwordInput}
            placeholder="Password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={(val) => { setPassword(val); setErrors(errors.filter(e => e !== 'password')); }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={style.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#7E8494" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={style.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={style.buttonText}>Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={style.toggleLink} onPress={() => navigation.navigate('Register')}>
          <Text style={style.toggleText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#11141A', alignItems: 'center', justifyContent: 'center', padding: 20 },
  logoText: { fontSize: 36, fontWeight: 'bold', color: '#3478F6', marginBottom: 8 },
  subTitle: { fontSize: 14, color: '#7E8494', marginBottom: 40, textAlign: 'center' },
  inputContainer: { width: '100%', maxWidth: 320 },
  input: { backgroundColor: '#1C212D', color: '#FFF', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 8, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2A3245' },
  errorInput: { borderColor: '#FF4D4D' },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C212D', borderRadius: 8, borderWidth: 1, borderColor: '#2A3245', marginBottom: 16 },
  passwordInput: { flex: 1, color: '#FFF', paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  eyeIcon: { paddingRight: 16 },
  button: { backgroundColor: '#3478F6', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  toggleLink: { marginTop: 20, alignItems: 'center' },
  toggleText: { color: '#3478F6', fontSize: 14, fontWeight: '500' },
});

