import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import moment from 'moment';
import close from '@/assets/images/close.png';
import { API_BASE_URL } from './config';
import { useAuth } from '../src/context/AuthContext'; // Import your auth context

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.5;

const HajesAqar = () => {
  // Extract id, startDate, and endDate from the URL parameters.
  const { id, startDate: initialStartDate = '', endDate: initialEndDate = '' } = useLocalSearchParams();
  const { user } = useAuth(); // Get the authenticated user and token
  const { x } = 1
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const basePrice = 100;
  const serviceFee = 20;
  const additionalFees = 10;
  const calculateTotal = () => basePrice + serviceFee + additionalFees;

  const formatArabicDate = (dateStr) => {
    if (!dateStr) return '-/-/2025';
    const date = moment(dateStr);
    return date.isValid() ? date.format('DD/MM/YYYY') : '-/-/2025';
  };

  const scrollX = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/gallery/${id}/`);
      if (!response.ok) throw new Error('Failed to fetch property details');
      const data = await response.json();

      let images = [];
      if (data.realestate && data.realestate.photo) {
        images.push(data.realestate.photo);
      }
      if (data.realestate && data.realestate.images && data.realestate.images.length > 0) {
        images = images.concat(data.realestate.images.map((imgObj) => imgObj.image));
      }
      const propertyDetails = { ...data.realestate, images };
      setProperty(propertyDetails);
    } catch (error) {
      console.error('Error fetching property details:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleBooking = async () => {
    if (!startDate || !endDate) {
      Alert.alert("خطأ", "يرجى اختيار تاريخ البداية والنهاية");
      return;
    }
    try {
      // Changed endpoint from "/reservation/" to "/DaysOff/" to invoke create_DaysOff_period
      console.log()
      const response = await fetch(`${API_BASE_URL}/DaysOff/${id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
        }),
      });
      console.log(`${API_BASE_URL}/mmm/${id}/`)
      if (response.ok) {
        navigation.navigate('DoneOwner', { id });
      } else {
        const errorData = await response.json();
        Alert.alert("خطأ", errorData.error || "فشل إنشاء الحجز");
      }
    } catch (error) {
      console.error("Booking error:", error);
      Alert.alert("خطأ", "مشكلة في الاتصال بالشبكة أو الخادم");
    }
  };



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D4FFF" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error loading property details.</Text>
      </View>
    );
  }

  const netPrice = property.price;

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {property.images.map((_, i) => {
          const inputRange = [
            (i - 1) * CARD_WIDTH,
            i * CARD_WIDTH,
            (i + 1) * CARD_WIDTH,
          ];
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
          });
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { opacity, transform: [{ scale }] }]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false} >
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={close} style={styles.close} />
          </TouchableOpacity>
          <View style={styles.topContainer}>
            <View style={styles.imageSection}>
              <Animated.FlatList
                data={property.images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.fullWidthImage} />
                )}
              />
              {renderPagination()}
            </View>
            <View style={styles.textSection}>
              <Text style={styles.title}>{property.type}</Text>
              <Text style={styles.title}>{property.town}</Text>
            </View>
          </View>
          <View style={styles.dateSection}>
            <Text style={styles.label}>تاريخ الحجز</Text>
            <View style={styles.dateRow}>
              <View style={styles.datesContainer}>
                <Text style={styles.dates}>{formatArabicDate(startDate)}</Text>
                <Text style={styles.arrow}>→</Text>
                <Text style={styles.dates}>{formatArabicDate(endDate)}</Text>
              </View>
              <TouchableOpacity
                style={styles.dateButton}

                onPress={() =>
                  navigation.navigate('CalenderOwner', { id, startDate, endDate, x })
                }
              >
                <Text style={styles.buttonText}>تحديد</Text>
              </TouchableOpacity>

            </View>
          </View>
          {/* مساحة لتجنب تغطية الزر */}
          <View style={styles.spacer} />
        </View>

      </ScrollView>
      <View style={styles.fixedButton}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleBooking}>
          <Text style={styles.confirmText}>تأكيد الحجز</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContent: {
    padding: 20,
  },
  container: {
    flex: 1,
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  imageSection: {
    width: 200,
    marginBottom: 20,
  },
  fullWidthImage: {
    width: 200,
    height: 200,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  textSection: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    textAlign: 'right',
    fontFamily: 'NotoKufiArabic-Bold',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4D4FFF',
    marginHorizontal: 5,
  },
  close: {
    width: 25,
    height: 25,
    marginBottom: 15,
  },
  dateSection: {
    marginTop: 20,
    paddingBottom: 20,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    fontFamily: 'NotoKufiArabic-Bold',
    color: '#444',
    marginBottom: 10,
    textAlign: 'right',
  },
  dateRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButton: {
    backgroundColor: '#4D4FFF',
    padding: 8,
    borderRadius: 5,
    width: 75,
    textAlign: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'NotoKufiArabic-Regular',

  },
  datesContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'NotoKufiArabic-Regular',
    color: '#2D2D2D',
    paddingHorizontal: 8,
  },
  arrow: {
    fontSize: 18,
    color: '#4D4FFF',
    marginHorizontal: 5,
  },
  fixedButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  confirmButton: {

    backgroundColor: '#4D4FFF',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  spacer: {
    height: 80,
  }
});

export default HajesAqar;