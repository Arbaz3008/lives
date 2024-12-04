import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { firestore, auth, storageService } from '../../firebase'; 
import { collection, addDoc, getDocs } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as Notifications from 'expo-notifications';

const CreateAdScreen = () => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const postData = async () => {
    if (!name || !desc || !year || !price || !phone) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }
  
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in to post an ad');
        return;
      }
      // Upload Image if available
      let imageUrl = 'default-image-url'; // Replace with an actual default image URL if needed
      if (imageUri) {
        const fileRef = ref(storageService, `ads/${Date.now()}`);
        const img = await fetch(imageUri);
        const bytes = await img.blob();
        await uploadBytes(fileRef, bytes);
        imageUrl = await getDownloadURL(fileRef);
      }

      // Add ad data to Firestore
      await addDoc(collection(firestore, 'ads'), {
        name,
        desc,
        year,
        phone,
        price,
        image: imageUrl,
        uid: user.uid,
        createdAt: new Date(),
      });

       // Fetch all user tokens to send notifications
    const usersSnapshot = await getDocs(collection(firestore, 'users'));
    const userTokens = usersSnapshot.docs.map(doc => doc.data().pushToken).filter(token => token);

    // Send push notifications to all users
    await sendBulkNotifications(userTokens);

      Alert.alert('Success', 'Ad posted successfully!');
      // Reset the form
      setName('');
      setDesc('');
      setYear('');
      setPrice('');
      setPhone('');
      setImageUri(null);
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Firestore Error:', err);
    }
  };
// Function to send bulk notifications to all users
const sendBulkNotifications = async (tokens) => {
  for (let token of tokens) {
    try {
      const message = {
        to: token,
        sound: 'default',
        title: 'New Ad Posted!',
        body: 'Check out the new ad posted in the app.',
        data: { screen: 'Home' },
      };

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
};

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setModalVisible(false);
    }
  };

  const openGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setModalVisible(false);
    }
  };

  return (
    <LinearGradient colors={['#edf7fc', '#d8eff8']} style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.heading}>Create Ad!</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Add your Description"
            value={desc}
            onChangeText={setDesc}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Year of purchase"
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Price in PKR"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Your Contact Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="numeric"
          />
          {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
          <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
            <View style={styles.buttonContent}>
              <Ionicons name="camera-outline" size={24} color="#fff" />
              <Text style={styles.buttonText}>
                {imageUri ? 'Change Image' : 'Upload Image'}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity  style={styles.button} onPress={postData}>
            <Text style={styles.buttonText}>Post</Text>
          </TouchableOpacity>

          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Choose Image</Text>
                <Pressable style={styles.modalButton} onPress={openCamera}>
                  <Text style={styles.modalButtonText}>Camera</Text>
                </Pressable>
                <Pressable style={styles.modalButton} onPress={openGallery}>
                  <Text style={styles.modalButtonText}>Gallery</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default CreateAdScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    marginHorizontal: 30,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  background: {
    flex: 1,
  },
  button: {
    backgroundColor: 'skyblue',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    marginHorizontal: 30,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: 'skyblue',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
  },
  modalCancelButton: {
    backgroundColor: 'red',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
  },
});
