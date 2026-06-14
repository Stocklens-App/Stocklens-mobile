import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const IP_ADDRESS = '192.168.100.189'; 

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
      await axios.post(`http://${IP_ADDRESS}:8081/auth/register`, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        phoneNumber: phoneNumber.trim()
      });
      Alert.alert('Success 🎉', 'Account created! Please sign in.');
      navigation.navigate('Login');
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.error || String(error.response.data);
        Alert.alert('Registration Failed', errorMessage);
      } else {
        Alert.alert('Network Error', 'Cannot reach backend server.');
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
        <TextInput 
          style={[style.input, errors.includes('name') && style.errorInput]}
          placeholder="Full Name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={(val) => { setName(val); setErrors(errors.filter(e => e !== 'name')); }}
        />

        <TextInput 
          style={[style.input, errors.includes('email') && style.errorInput]}
          placeholder="Email Address"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={(val) => { setEmail(val); setErrors(errors.filter(e => e !== 'email')); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput 
          style={[style.input, errors.includes('phone') && style.errorInput]}
          placeholder="Phone Number"
          placeholderTextColor="#aaa"
          value={phoneNumber}
          onChangeText={(val) => { setPhoneNumber(val); setErrors(errors.filter(e => e !== 'phone')); }}
          keyboardType="phone-pad"
        />

        <TextInput 
          style={[style.input, errors.includes('password') && style.errorInput]}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={(val) => { setPassword(val); setErrors(errors.filter(e => e !== 'password')); }}
          secureTextEntry={true}
          autoCapitalize="none"
        />

        <TextInput 
          style={[style.input, errors.includes('confirm') && style.errorInput]}
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          value={confirmPassword}
          onChangeText={(val) => { setConfirmPassword(val); setErrors(errors.filter(e => e !== 'confirm')); }}
          secureTextEntry={true}
        />

        <TouchableOpacity style={style.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={style.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={style.toggleLink} onPress={() => navigation.navigate('Login')}>
          <Text style={style.toggleText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#11141A', alignItems: 'center', justifyContent: 'center', padding: 20 },
  logoText: { fontSize: 32, fontWeight: 'bold', color: '#3478F6', marginBottom: 8 },
  subTitle: { fontSize: 14, color: '#7E8494', marginBottom: 40, textAlign: 'center' },
  inputContainer: { width: '100%', maxWidth: 320 },
  input: { backgroundColor: '#1C212D', color: '#FFF', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 8, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2A3245' },
  errorInput: { borderColor: '#FF4D4D' },
  button: { backgroundColor: '#3478F6', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  toggleLink: { marginTop: 20, alignItems: 'center' },
  toggleText: { color: '#3478F6', fontSize: 14, fontWeight: '500' },
});