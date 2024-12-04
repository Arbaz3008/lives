import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import { auth, firestore } from '../../firebase'; 
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Card, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'; 
import { LinearGradient } from 'expo-linear-gradient';

const AccountScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation(); 

  const getDetails = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(firestore, 'ads'), where('uid', '==', user.uid));
        const querySnap = await getDocs(q);
        const result = querySnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setItems(result);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
      Alert.alert('Error', 'Failed to fetch ads. Please try again later.');
    }
  };

  useEffect(() => {
    getDetails();
  }, []);

  const openDial = (phone) => {
    // Implement openDial function if needed
  };

  const handleEdit = (item) => {
    navigation.navigate('EditAd', { item });
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Title
        title={<Text style={styles.cardTitle}>{item.name || 'Unnamed Item'}</Text>}
      />
      <Card.Content style={styles.cardContent}>
        <Paragraph>{item.desc?.length > 100 ? `${item.desc.substring(0, 100)}...` : item.desc}</Paragraph>
        <Paragraph>Year: {item.year}</Paragraph>
      </Card.Content>
      <Card.Cover source={{ uri: item.image }} />
      <View style={styles.actions}>
        <TouchableOpacity style={styles.priceButton}>
          <Text style={styles.buttonText}>Price: PKR {item.price || 'N/A'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => openDial(item.phone)}
        >
          <Text style={styles.buttonText}>Call Seller</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <LinearGradient colors={['#edf7fc', '#d8eff8']} style={styles.background}>
    <View style={styles.container}>
      {auth.currentUser ? (
        <>
          <Text style={styles.emailText}>{auth.currentUser.email}</Text>
          <TouchableOpacity style={styles.button} onPress={() => auth.signOut()}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.emailText}>No user logged in</Text>
      )}
      <Text style={styles.adTitle}>Your Ads!</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id} // Ensure each item has a unique ID
        renderItem={renderItem}
        onRefresh={() => {
          setLoading(true);
          getDetails();
          setLoading(false);
        }}
        refreshing={loading}
        ListEmptyComponent={<Text style={styles.emptyMessage}>No items found</Text>}
      />
    </View>
    </LinearGradient>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    padding: 20,
    top:25,
    padding: 10,
  },
  emailText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'skyblue',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 15,
    borderRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    paddingVertical: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  priceButton: {
    backgroundColor: 'skyblue',
    padding: 10,
    borderRadius: 5,
  },
  callButton: {
    backgroundColor: 'skyblue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
  cardTitle: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: 'skyblue',
    padding: 10,
    borderRadius: 5,
  },
  background: {
    flex: 1,
  },
  adTitle:{
    fontSize:26,
    fontWeight:'bold'
  }
});