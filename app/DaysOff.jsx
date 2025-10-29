

import close from '@/assets/images/close.png';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { API_BASE_URL } from './config/config';

// Add ErrorMessageModal component
const ErrorMessageModal = ({ visible, message, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.errorModalOverlay}>
          <View style={styles.errorModalContainer}>
            <Text style={styles.errorModalText}>{message}</Text>
            <TouchableOpacity
              style={styles.errorModalButton}
              onPress={onClose}
            >
              <Text style={styles.errorModalButtonText}>موافق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.5;

const DaysOff = () => {
  const { id, startDate: initialStartDate = '', endDate: initialEndDate = '' } = useLocalSearchParams();
  const { user } = useAuth();
  const { x } = 1;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
      setErrorMessage("يرجى اختيار تاريخ البداية والنهاية");
      setErrorVisible(true);
      return;
    }
    try {
   
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
     
      if (response.ok) {
        navigation.navigate('DoneOwner', { id });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "فشل إنشاء الحجز");
        setErrorVisible(true);
      }
    } catch (error) {
      console.error("Booking error:", error);
      setErrorMessage("مشكلة في الاتصال بالشبكة أو الخادم");
      setErrorVisible(true);
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
  if (!property.images || property.images.length === 0) return null;

  return (
    <View style={styles.paginationContainer}>
      <View style={styles.currentIndexContainer}>
        <Text style={styles.currentIndexText}>
          {currentImageIndex + 1}/{property.images.length}
        </Text>
      </View>
    </View>
  );
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <ErrorMessageModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
      
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
    {
      useNativeDriver: false,
      listener: event => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const viewSize = event.nativeEvent.layoutMeasurement.width;
        const pageNum = Math.floor(offsetX / viewSize + 0.5);
        if (pageNum !== currentImageIndex) {
          setCurrentImageIndex(pageNum);
        }
      }
    }
  )}
  scrollEventThrottle={1} // زيادة دقة التتبع
  keyExtractor={(_, index) => index.toString()}
  renderItem={({ item }) => (
    <Image source={{ uri: item }} style={styles.fullWidthImage} />
  )}
/>
              {renderPagination()}
            </View>
            <View style={styles.textSection}>
              <Text style={styles.title}>{property.type}</Text>
              <Text style={styles.title}>{property.city}</Text>

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
          <View style={styles.container2}>
            <Text style={styles.label}>وقت الوصول والمغادرة</Text>
            <View style={styles.dateContainer}>
              <Text style={styles.textPrice}>المغادرة: {property?.checkout || 'غير محدد'}</Text>
              <Text style={styles.textPrice}>الوصول: {property?.checkin || 'غير محدد'}</Text>
            </View>
          </View>
           <View style={styles.container2}>
                    <Text style={styles.label}>تفاصيل الايجار</Text>
                    <View style={styles.container4}>
                      <Text style={styles.textPrice}>{property.price_with_benefit} $</Text>
                      <Text style={styles.textPrice}>اجار اليوم داخل الاسبوع</Text>
                    </View>
                    <View style={styles.container4}>
                      <Text style={styles.textPrice}>{property.holiday_price || property.price_with_benefit} $</Text>
                      <Text style={styles.textPrice}>اجار يوم الجمعة او السبت</Text>
                    </View>
                    <View style={styles.container4}>
                      <Text style={styles.textPrice}>{property.ead_price|| property.price_with_benefit} $</Text>
                      <Text style={styles.textPrice}>اجار يوم العيد </Text>
                    </View>
                    
                  </View>
          <View style={styles.spacer} />
        </View>
      </ScrollView>
      <View style={styles.fixedButton}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleBooking}>
          <Text style={styles.confirmText}>تأكيد الحجز</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  },
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModalContainer: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4D4FFF',
  },
  errorModalText: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'NotoKufiArabic-Regular',
    color: '#333',
    marginBottom: 20,
  },
  errorModalButton: {
    backgroundColor: '#4D4FFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  errorModalButtonText: {
    color: '#fff',
    fontFamily: 'NotoKufiArabic-Bold',
    fontSize: 16,
  },
  container2: {
    padding: 10,
    borderBlockColor: 'gray',
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 18,
    textAlign: 'right',
    fontFamily: 'NotoKufiArabic-Bold',
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
   paginationContainer: {
    position: 'absolute',
    bottom: 15,
    right: 15,
  },
  currentIndexContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  currentIndexText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'NotoKufiArabic-Bold',
  },
   dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default DaysOff;