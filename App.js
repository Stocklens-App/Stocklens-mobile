import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Standard with Expo
import axios from 'axios';

export default function App() {
  const [screenMode, setScreenMode] = useState('login'); 
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]); // Tracks which fields are empty

  const IP_ADDRESS = '192.168.100.189'; 

  const validateFields = () => {
    let newErrors = [];
    if (screenMode === 'register' && !name) newErrors.push('name');
    if (!email) newErrors.push('email');
    if (!password) newErrors.push('password');
    if (screenMode === 'register' && !phoneNumber) newErrors.push('phone');
    if (screenMode === 'register' && !confirmPassword) newErrors.push('confirm');
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleLogin = async () => {
    if (!validateFields()) return;
    setLoading(true);
    try {
      const response = await axios.post(`http://${IP_ADDRESS}:8081/auth/login`, {
        email: email.trim(),
        password: password
      });
      Alert.alert('Success 🎉', response.data);
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateFields()) return;
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`http://${IP_ADDRESS}:8081/auth/register`, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        phoneNumber: phoneNumber.trim()
      });
      Alert.alert('Success 🎉', 'Account created! Please sign in.');
      setScreenMode('login');
    } catch (error) {
      console.log("Full Registration Error:", error.response);
      
      if (error.response && error.response.data) {
        // 1. If your backend sends a JSON Map (like Map.of("error", "Email exists"))
        if (error.response.data.error) {
          Alert.alert('Registration Failed', error.response.data.error);
        } 
        // 2. If the backend sends a plain string error message
        else {
          Alert.alert('Registration Failed', String(error.response.data));
        }
      } else {
        Alert.alert('Network Error', 'Cannot reach backend server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={style.container}>
      <Text style={style.logoText}>StockLens</Text>
      <Text style={style.subTitle}>Track stock, sales, and profits in real-time</Text>

      <View style={style.inputContainer}>
        {screenMode === 'register' && (
          <TextInput 
            style={[style.input, errors.includes('name') && style.errorInput]}
            placeholder="Full Name"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={(val) => { setName(val); setErrors(errors.filter(e => e !== 'name')); }}
          />
        )}

        <TextInput 
          style={[style.input, errors.includes('email') && style.errorInput]}
          placeholder="Email Address"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={(val) => { setEmail(val); setErrors(errors.filter(e => e !== 'email')); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {screenMode === 'register' && (
          <TextInput 
            style={[style.input, errors.includes('phone') && style.errorInput]}
            placeholder="Phone Number"
            placeholderTextColor="#aaa"
            value={phoneNumber}
            onChangeText={(val) => { setPhoneNumber(val); setErrors(errors.filter(e => e !== 'phone')); }}
            keyboardType="phone-pad"
          />
        )}

        {/* Password field with Eye Icon */}
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

        {screenMode === 'register' && (
          <TextInput 
            style={[style.input, errors.includes('confirm') && style.errorInput]}
            placeholder="Confirm Password"
            placeholderTextColor="#aaa"
            value={confirmPassword}
            onChangeText={(val) => { setConfirmPassword(val); setErrors(errors.filter(e => e !== 'confirm')); }}
            secureTextEntry={!showPassword}
          />
        )}

        <TouchableOpacity 
          style={style.button} 
          onPress={screenMode === 'login' ? handleLogin : handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={style.buttonText}>{screenMode === 'login' ? 'Sign In' : 'Create Account'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={style.toggleLink} onPress={() => setScreenMode(screenMode === 'login' ? 'register' : 'login')}>
          <Text style={style.toggleText}>{screenMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}</Text>
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
  errorInput: { borderColor: '#FF4D4D' }, // Red border for errors
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C212D', borderRadius: 8, borderWidth: 1, borderColor: '#2A3245', marginBottom: 16 },
  passwordInput: { flex: 1, color: '#FFF', paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  eyeIcon: { paddingRight: 16 },
  button: { backgroundColor: '#3478F6', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  toggleLink: { marginTop: 20, alignItems: 'center' },
  toggleText: { color: '#3478F6', fontSize: 14, fontWeight: '500' },
});