import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { firestore } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

const EditAdScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [name, setName] = useState(item.name);
  const [desc, setDesc] = useState(item.desc);
  const [price, setPrice] = useState(item.price);
  const [year, setYear] = useState(item.year);

  const handleSave = async () => {
    try {
      const adRef = doc(firestore, 'ads', item.id);
      await updateDoc(adRef, {
        name,
        desc,
        price,
        year,
      });
      Alert.alert('Success', 'Ad updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating ad:', error);
      Alert.alert('Error', 'Failed to update ad. Please try again later.');
    }
  };

  return (
    <LinearGradient colors={['#edf7fc', '#d8eff8']} style={styles.background}>
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Name"
      />
      <TextInput
        style={styles.input}
        value={desc}
        onChangeText={setDesc}
        placeholder="Description"
        multiline
      />
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Price"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={year}
        onChangeText={setYear}
        placeholder="Year"
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
   </LinearGradient>
  );
};

export default EditAdScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  button: {
    backgroundColor: 'deepskyblue',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  background: {
    flex: 1,
  },
});
