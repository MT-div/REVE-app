// src/screens/CardDitals.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from '../../app/config/config'; // Adjust path if needed

const { width } = Dimensions.get('window');

const CardDitals = () => {
  // Extract the real estate id from route parameters.
  const route = useRoute();
  console.log('Route object:', route); // Debugging route object

  const { realEstateId } = route.params || {}; // Safely extract realEstateId
  console.log('RealEstate ID:', realEstateId);   // State variables for loading and property data.
  const [loading, setLoading] = useState(true);
  const [propertyData, setPropertyData] = useState(null);
  if (!realEstateId) {
    console.error("No realEstateId provided in route.params!");
    Alert.alert("Error", "Property details cannot be loaded.");
    navigation.goBack(); // Return to Gallary if ID is missing
    return null;
  }
  // Fetch the property details using the id.
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Adjust the URL so that it matches your endpoint.
        const response = await axios.get(`${API_BASE_URL}/res_profile/${realEstateId}/`);
        // Assuming the endpoint returns an object with a "realestate" field.
        setPropertyData(response.data.realestate);
      } catch (error) {
        console.error('Error fetching details:', error);
        Alert.alert('خطأ', 'تعذر تحميل تفاصيل العقار');
      } finally {
        setLoading(false);
      }
    };

    if (realEstateId) {
      fetchDetails();
    }
  }, [realEstateId]);

  // Show a loading spinner while fetching data.
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D4FFF" />
        <Text>جاري تحميل البيانات...</Text>
      </View>
    );
  }

  // If no property data exists, show a message.
  if (!propertyData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>لا توجد بيانات</Text>
      </View>
    );
  }

  // Aggregate images: combine the main photo and additional images.
  const aggregatedImages = useMemo(() => {
    let imgs = [];
    if (propertyData.photo) {
      imgs.push(propertyData.photo);
    }
    if (propertyData.images && Array.isArray(propertyData.images)) {
      propertyData.images.forEach((imgObj) => {
        if (imgObj.image) {
          imgs.push(imgObj.image);
        }
      });
    }
    return imgs;
  }, [propertyData]);

  // Render each image item in the flat list.
  const renderImageItem = ({ item }) => (
    <Image source={{ uri: item }} style={styles.propertyImage} />
  );

  return (
    <ScrollView style={styles.container}>
      {/* Horizontal image slider */}
      <FlatList
        data={aggregatedImages}
        renderItem={renderImageItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />

      {/* Property Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{propertyData.title}</Text>
        <Text style={styles.location}>
          {propertyData.city} - {propertyData.town}
        </Text>
        <Text style={styles.price}>{propertyData.price}</Text>
        <Text style={styles.type}>{propertyData.type}</Text>
        {/* Add more fields as needed */}
      </View>

      {/* Optionally, you can render reviews and additional details here */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  propertyImage: {
    width: width,
    height: 250,
    resizeMode: 'cover'
  },
  detailsContainer: {
    padding: 16
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8
  },
  location: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 8
  },
  price: {
    fontSize: 18,
    color: '#4D4FFF',
    marginBottom: 8
  },
  type: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8
  }
});

export default CardDitals;
