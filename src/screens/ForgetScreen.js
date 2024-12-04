import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'; // Import Firebase

const ForgetScreen = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation(); // Use navigation hook

  const handleSubmit = async () => {
    if (!email) {
      alert('Please enter your email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Firebase Password Reset Logic
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset link has been sent to your email.');
      navigation.navigate('Auth', { screen: 'LoginScreen' }); // Navigate to LoginScreen
    } catch (error) {
      let errorMessage = 'An error occurred.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      alert(errorMessage);
      console.error('Password reset error:', error);
    }
  };

  return (
    <LinearGradient colors={['#edf7fc', '#d8eff8']} style={styles.background}>
      <View style={styles.container}>
        <Image
          style={{ marginVertical: 60, width: 200, height: 200 }}
          source={require('../../assets/logo.png')}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default ForgetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  input: {
    height: 50,
    width: '100%',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: 'skyblue',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  background: {
    flex: 1,
  },
});
