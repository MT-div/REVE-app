
import close from '@/assets/images/close.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
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

const HajesAqar = () => {
  const { id, startDate: initialStartDate = '', endDate: initialEndDate = '' } = useLocalSearchParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
      const propertyDetails = { ...data.realestate, images,price_with_benefit: data.realestate.price_with_benefit || 0, // قيم افتراضية
  ead_price_with_benefit: data.realestate.ead_price_with_benefit || 0,
  holiday_price_with_benefit: data.realestate.holiday_price_with_benefit || 0 };
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
        const response = await fetch(`${API_BASE_URL}/reservation/${id}/`, {
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

        const responseData = await response.json(); // استخراج البيانات من الاستجابة


        if (response.ok) {
            navigation.navigate('Done', { id });
        } else {
            setErrorMessage(responseData.error || responseData["تنبيه!"] || "فشل إنشاء الحجز");
            setErrorVisible(true);
        }
    } catch (error) {
        console.error("Booking error:", error);
        setErrorMessage("مشكلة في الاتصال بالشبكة أو الخادم");
        setErrorVisible(true);
    }
};
  const handleNavigateCalendar = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      setErrorMessage('يجب تسجيل الدخول أولاً');
      setErrorVisible(true);
      navigation.navigate('loginpage');
      return;
    }
    navigation.navigate('Calendar', { id, startDate, endDate });
  };

  let computedNetPrice = 0;
let computedFirstPayment = 0;
let computedSecondPayment = 0;
if (property && startDate && endDate) {
  const start = moment(startDate);
  const end = moment(endDate);
  
  // تحقق من صحة التواريخ
  if (!start.isValid() || !end.isValid()) return; 

  let current = start.clone();
  
  while (current.isSameOrBefore(end)) {
    const isEid = current.month() === 5 && 
                 current.date() >= 6 && 
                 current.date() <= 9;
    
    const isHoliday = current.day() === 5 || 
                      current.day() === 6;
    
    // تحويل القيم إلى أرقام مع قيمة افتراضية 0
    computedNetPrice += isEid ? 
      Number(property.ead_price_with_benefit || property.price_with_benefit) :
      isHoliday ? 
        Number(property.holiday_price_with_benefit || property.price_with_benefit) :
        Number(property.price_with_benefit || 1000);
    
    current.add(1, 'day');
  }
  
  computedFirstPayment = computedNetPrice * 0.50;
  computedSecondPayment = computedNetPrice - computedFirstPayment;
}

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Text></Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <ErrorMessageModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
      
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.push('CardDitals', { from: 'HajesAqar',id })}>
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
      listener: (event) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const viewSize = event.nativeEvent.layoutMeasurement.width;
        const pageNum = Math.floor(contentOffset / viewSize + 0.5);
        if (pageNum !== currentImageIndex) {
          setCurrentImageIndex(pageNum);
        }
      }
    }
  )}
  scrollEventThrottle={1} // مهم جداً لزيادة دقة التتبع
  keyExtractor={(_, index) => index.toString()}
  renderItem={({ item }) => (
    <Image source={{ uri: item }} style={styles.fullWidthImage} />
  )}
/>
    {property.images && (
  <View style={styles.paginationContainer}>
    <Text style={styles.currentIndexText}>
      {currentImageIndex + 1}/{property.images.length}
    </Text>
  </View>
)}
          </View>
          <View style={styles.textSection}>
            <Text style={styles.title}>{property.type}</Text>
                        <Text style={styles.title}>{property.city}</Text>
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

 <View style={styles.container2}>
  <Text style={styles.label}>وقت الوصول والمغادرة</Text>
  <View style={styles.dateContainer}>
        <Text style={styles.textarrive}>المغادرة: <Text style={styles.textPrice}>{property?.checkout || 'غير محدد'}</Text></Text>

    <Text style={styles.textarrive}>الوصول: <Text style={styles.textPrice}>{property?.checkin || 'غير محدد'}</Text></Text>
  </View>
</View>

       <View style={styles.container2}>
          <Text style={styles.label}>تفاصيل الايجار</Text>
          <View style={styles.container4}>
            <Text style={styles.textPrice}>{property.price_with_benefit} $</Text>
            <Text style={styles.textPrice}>اجار اليوم داخل الاسبوع</Text>
          </View>
          <View style={styles.container4}>
            <Text style={styles.textPrice}>{property.holiday_price_with_benefit || property.price_with_benefit} $</Text>
            <Text style={styles.textPrice}>اجار يوم الجمعة او السبت</Text>
          </View>
          <View style={styles.container4}>
            <Text style={styles.textPrice}>{property.ead_price_with_benefit|| property.price_with_benefit} $</Text>
            <Text style={styles.textPrice}>اجار يوم العيد </Text>
          </View>
          
        </View>

        <View style={styles.container5}>
          <View style={styles.container3}>
             <Text style={styles.total}>
    {(computedNetPrice || 0).toFixed(2)} $
  </Text>
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
    marginTop:10,
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
    padding: 10,
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
  textarrive:{
     fontSize: 15,
    marginVertical: 2,
    fontFamily: 'NotoKufiArabic-Regular',
    color:'#4d4fff',
  },
  textPrice: {
    fontSize: 15,
    marginVertical: 2,
    fontFamily: 'NotoKufiArabic-Regular',
    color:'#000'
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
    paginationContainer: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  currentIndexText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'NotoKufiArabic-Bold',
  },
  currentIndexContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10, // زوايا أكثر استدارة
    paddingHorizontal: 8,  // أصغر من السابق
    paddingVertical: 4,    // أصغر من السابق
  },

});


export default HajesAqar;