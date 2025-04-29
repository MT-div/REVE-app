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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import moment from 'moment';
import close from '@/assets/images/close.png';
import { API_BASE_URL } from './config';
import { useAuth } from '../src/context/AuthContext'; // Import your auth context
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.5;

const HajesAqar = () => {
  // Extract id, startDate, and endDate from the URL parameters.
  const { id, startDate: initialStartDate = '', endDate: initialEndDate = '' } = useLocalSearchParams();
  const { user } = useAuth(); // Get the authenticated user and token

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

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
      const response = await fetch(`${API_BASE_URL}/reservation/${id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`, // Added token header
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
        }),
      });
      if (response.ok) {
        navigation.navigate('Done', { id });
      } else {
        const errorData = await response.json();
        Alert.alert("خطأ", errorData.error || "فشل إنشاء الحجز");
      }
    } catch (error) {
      console.error("Booking error:", error);
      Alert.alert("خطأ", "مشكلة في الاتصال بالشبكة أو الخادم");
    }
  };

  // This function checks if the user is logged in before going to the Calendar screen.
  const handleNavigateCalendar = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
      navigation.navigate('loginpage');
      return;
    }
    navigation.navigate('Calendar', { id, startDate, endDate });
  };

  // Calculate the net price (السعر الصافي), first installment (الدفعة الاولى), and second installment (الدفعة الثانية)
  let computedNetPrice = 0;
  let computedFirstPayment = 0;
  let computedSecondPayment = 0;
  if (property && startDate && endDate) {
    const start = moment(startDate);
    const end = moment(endDate);
    let numberOfDays = end.diff(start, 'days') + 1;
    if (numberOfDays < 1) numberOfDays = 1; // Default to at least 1 day
    computedNetPrice = property.price * numberOfDays;
    computedFirstPayment = computedNetPrice * 0.30;
    computedSecondPayment = computedNetPrice - computedFirstPayment;
  }

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

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Updated the button from goBack() to navigating to 'CardDitals' passing the id */}
        <TouchableOpacity onPress={() => navigation.push('CardDitals', { id })}>
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
            {property.images && (
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
            )}
          </View>
          <View style={styles.textSection}>
            <Text style={styles.title}>{property.type}</Text>
            <Text style={styles.title}>{property.town}</Text>
          </View>
        </View>

        <View style={styles.container2}>
          <Text style={styles.label}>تاريخ الحجز</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity style={styles.button} onPress={handleNavigateCalendar}>
              <Text style={styles.buttonText}>تحديد</Text>
            </TouchableOpacity>
            <View style={styles.dateContainer}>
              <Text style={styles.dates}>{formatArabicDate(startDate)}</Text>
              <Text style={styles.arrow}>→</Text>
              <Text style={styles.dates}>{formatArabicDate(endDate)}</Text>
            </View>
          </View>
        </View>

        {/* السعر اليومي */}
        <View style={styles.container2}>
          <Text style={styles.label}>تفاصيل السعر</Text>
          <View style={styles.container4}>
            <Text style={styles.textPrice}>{property.price} $</Text>
            <Text style={styles.textPrice}>السعر {property.period} الواحد</Text>
          </View>
        </View>

        {/* السعر الصافي والدفعات */}
        <View style={styles.container5}>
          <View style={styles.container3}>
            <Text style={styles.total}>{computedNetPrice.toFixed(2)} $</Text>
            <Text style={styles.total}>الصافي</Text>
          </View>
          <View style={styles.container4}>
            <Text style={styles.textPrice}>{computedFirstPayment.toFixed(2)} $</Text>
            <Text style={styles.textPrice}>الدفعة الاولى</Text>
          </View>
          <View style={styles.container4}>
            <Text style={styles.textPrice}>{computedSecondPayment.toFixed(2)} $</Text>
            <Text style={styles.textPrice}>الدفعة الثانية</Text>
          </View>
        </View>

        <View style={styles.sendContainer}>
          <TouchableOpacity style={styles.sendbutton} onPress={handleBooking}>
            <Text style={styles.buttonText}>ارسال طلب حجز</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,

  },

  fullWidthImage: {
    width: 200,
    height: 200,
    borderRadius: 15,
    resizeMode: 'cover',
  },
 
  title: {
    fontSize: 15,
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
    width: 20,
    height: 20,
    marginLeft:10,
    marginVertical:10,

  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingTop:20,
    alignContent:'center',
    alignItems:'center',
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  imageSection: {
    width: 200,
  },
  textSection: {
    marginRight:10,
    justifyContent: 'center',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  total: {
    fontSize: 18,
    fontFamily: 'NotoKufiArabic-Bold',
  },
  container2: {
    padding: 20,
    borderBlockColor: 'gray',
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 18,
    textAlign: 'right',
    fontFamily: 'NotoKufiArabic-Bold',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dates: {
    borderColor: '#ccc',
    width: 100,
    fontSize:16,
    textAlign: 'center',
    justifyContent: 'space-between',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  arrow: {
    fontSize: 20,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  button: {
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
  container5:{
    padding: 20,
    borderBlockColor: 'gray',
    borderBottomWidth: 1,
  },
  container3: {
    
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container4: {
    padding: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textPrice: {
    fontSize: 15,
    marginVertical: 2,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  sendContainer: {
    padding: 20,
    borderBlockColor: 'gray',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'NotoKufiArabic-Regular',

  },
  sendbutton: {
    backgroundColor: '#4D4FFF',
    padding: 10,
    borderRadius: 5,
    width: 300,
    textAlign: 'center',
    alignItems: 'center',
    fontFamily: 'NotoKufiArabic-Regular',
  },
});

export default HajesAqar;