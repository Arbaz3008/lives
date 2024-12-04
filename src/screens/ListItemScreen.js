import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { Card, Paragraph } from 'react-native-paper';
import { firestore } from '../../firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

const ListItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading]  = useState(false);
  const getDetails = async () => {
    try {
      const querySnap = await getDocs(collection(firestore, 'ads'));
      const result = querySnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setItems(result);
    } catch (error) {
      console.error('Error fetching ads:', error);
      Alert.alert('Error', 'Failed to fetch ads. Please try again later.');
    }
  };

  const openDial = (phone) => {
    if (Platform.OS === 'android') {
      Linking.openURL(`tel:${phone}`);
    } else {
      Linking.openURL(`telprompt:${phone}`);
    }
  };

  useEffect(() => {
    getDetails();
  }, []);

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
      </View>
    </Card>
  );

  return (
    <LinearGradient colors={['#edf7fc', '#d8eff8']} style={styles.background}>
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id} // Ensure each item has a unique ID
        renderItem={renderItem}
        onRefresh={()=>{
          setLoading(true)
          getDetails()
          setLoading(false)
        }}
        refreshing={loading}
        ListEmptyComponent={<Text style={styles.emptyMessage}>No items found</Text>}
      />
    </View>
    </LinearGradient>
  );
};

export default ListItems;

const styles = StyleSheet.create({
  container: {
    top:25,
    flex: 1,
    padding: 10,
    backgroundColor: '#F6F6F6',
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
  background: {
    flex: 1,
  },
});
