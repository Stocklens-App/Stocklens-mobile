import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 🌐 CONNECTS FRONTEND TO BACKEND
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // REPLACE THIS IP WITH YOUR ACTUAL LAPTOP IP (Keep the :8081/auth/login)
      const backendUrl = 'http://192.168.100.189:8081/auth/login'; 
      
      const response = await axios.post(backendUrl, {
        email: email.trim(),
        password: password
      });

      // Spring Boot returns a plain string on 200 OK success
      Alert.alert('Success 🎉', response.data);
    } catch (error) {
      console.log('Login Error Details:', error);
      if (error.response) {
        // Server responded with an error status (401, 404, etc)
        Alert.alert('Login Failed', error.response.data);
      } else {
        // Network connection failure
        Alert.alert('Network Error', 'Cannot reach backend server. Check your IP address.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={style.container}>
      <Text style={style.logoText}>StockLens</Text>
      <Text style={style.subTitle}>Manage your business inventory smoothly</Text>

      <View style={style.inputContainer}>
        <TextInput 
          style={style.input}
          placeholder="Email Address"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput 
          style={style.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          autoCapitalize="none"
        />

        <TouchableOpacity 
          style={style.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={style.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11141A', // Sleek dark mode background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3478F6', // Brand blue accent
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: '#7E8494',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 320,
  },
  input: {
    backgroundColor: '#1C212D',
    color: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A3245',
  },
  button: {
    backgroundColor: '#3478F6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#3478F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});