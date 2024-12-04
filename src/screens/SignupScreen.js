import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, firestore } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const navigation = useNavigation();
  const [visiblePasswordEye, setVisiblePasswordEye] = useState(false);
  const [visibleConfirmPasswordEye, setVisibleConfirmPasswordEye] = useState(false);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    if (!email || !password || !confirmpassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (password !== confirmpassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      // Create a new user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Optional: Save additional user information in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      alert('Signup successful! Redirecting to Login...');
      
      // Ensure the user logs out to avoid being redirected due to auth state changes
      await auth.signOut();

      // Navigate to LoginScreen
      navigation.navigate('LoginScreen');
    } catch (error) {
      console.error('Error signing up:', error);
      alert(error.message || 'An error occurred during signup.');
    }
  };

  return (
    <LinearGradient colors={['#edf7fc', '#dcf0fa']} style={styles.background}>
      <View>
        <View style={styles.box1}>
          <Image style={styles.logo} source={require('../../assets/logo.png')} />
        </View>
        <View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={!visiblePasswordEye}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setVisiblePasswordEye(!visiblePasswordEye)}
            >
              <MaterialCommunityIcons
                name={visiblePasswordEye ? 'eye-outline' : 'eye-off'}
                size={24}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmpassword}
              onChangeText={(text) => setConfirmPassword(text)}
              secureTextEntry={!visibleConfirmPasswordEye}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setVisibleConfirmPasswordEye(!visibleConfirmPasswordEye)}
            >
              <MaterialCommunityIcons
                name={visibleConfirmPasswordEye ? 'eye-outline' : 'eye-off'}
                size={24}
              />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.loginText}>Already have an account? Log In</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  box1: {
    alignItems: 'center',
  },
  logo: {
    marginVertical: 60,
    width: 200,
    height: 200,
  },
  inputContainer: {
    marginHorizontal: 15,
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#50b8e7',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loginText: {
    textAlign: 'right',
    top: 10,
    color: '#50b8e7',
    fontSize: 17,
    marginHorizontal: 15,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  background: {
    flex: 1,
  },
});
