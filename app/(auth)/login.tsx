/*
Login Screen for Tree-ver App
Author: JH

1.00 JH Initial release with basic login functionality.
*/

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Simulated login: accepts any username/password
    if (username && password) {
      await AsyncStorage.setItem('userToken', 'loggedIn');
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Please enter username and password.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌳 Tree Cult Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#a0a0a0"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#a0a0a0"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f2f23', padding: 20 },
  title: { fontSize: 28, color: '#6ee7b7', marginBottom: 40, fontWeight: 'bold' },
  input: { width: '100%', backgroundColor: '#123a2c', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 15 },
  button: { backgroundColor: '#6ee7b7', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#0f2f23', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: '#d1fae5', textDecorationLine: 'underline', marginTop: 10 },
});
