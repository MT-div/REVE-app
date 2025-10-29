import arrow from '@/assets/images/arrow.png';
import blue from '@/assets/images/blue.png';
import Edit from '@/assets/images/Edit.png';
import Empty from '@/assets/images/Empty.png';
import green from '@/assets/images/green.png';
import house2 from '@/assets/images/house2.jpg';
import MaleUser from '@/assets/images/MaleUser.png';
import star from '@/assets/images/star.png';
import yellow from '@/assets/images/yellow.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { API_BASE_URL } from './config/config';

const CARD_WIDTH = 338 + 40; // Card width plus margins

const ProfilePage = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState({});
  // States for backend data
  const [profileInfo, setProfileInfo] = useState(null);
  const [bookingsData, setBookingsData] = useState([]); // reservations
  const [propertiesData, setPropertiesData] = useState([]); // real estates
  const [loading, setLoading] = useState(true);

  // Refs for horizontal scrolling animations
  const bookingScrollX = useRef(new Animated.Value(0)).current;
  const propertyScrollX = useRef(new Animated.Value(0)).current;

  // Helper: select type image based on real estate type
  const getTypeImage = (type) => {
    switch (type) {
      case 'شقة':
        return green;
      case 'فيلا':
        return blue;
      case 'مزرعة':
        return yellow;
      default:
        return green;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('authToken');

        if (!token) {
          navigation.navigate('loginpage');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/profile/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        // تحقق من حالة الاستجابة
        if (response.status >= 200 && response.status < 300) {
          const data = response.data;
          setProfileInfo(data);

          // معالجة بيانات الحجوزات
          const formattedBookings = data["your reservations are"]?.map((res) => ({
            key: `res-${res.id}`,
            place: `${res.city || 'غير محدد'} - ${res.town || 'غير محدد'}`,
            cost: `${res.price_with_benefit || 0}$`,
            rate: res.ratings || 'غير مُقيَّم',
            date: res.period || 'بدون تاريخ',
            type: res.type || 'غير معروف',
            id: res.id,
            image: res.photo ? { uri: res.photo } : house2,
            typeimg: getTypeImage(res.type),
          })) || [];

          setBookingsData(formattedBookings);

          // معالجة بيانات العقارات
          const formattedProperties = data["your real estates are"]?.map((res) => ({
            key: `res-${res.id}`,
            place: `${res.city || 'غير محدد'} - ${res.town || 'غير محدد'}`,
            cost: `${res.price_with_benefit || 0}$`,
            rate: res.ratings || 'غير مُقيَّم',
            date: res.period || 'بدون تاريخ',
            type: res.type || 'غير معروف',
            id: res.id,
            image: res.photo ? { uri: res.photo } : house2,
            typeimg: getTypeImage(res.type),
          })) || [];

          setPropertiesData(formattedProperties);
        } else {
          throw new Error(response.data?.message || 'Server returned an error');
        }
      } catch (err) {
        console.error("Error fetching profile:", {
          error: err.message,
          response: err.response?.data,
          status: err.response?.status
        });

        Alert.alert(
          'خطأ',
          err.response?.data?.error || 'حدث خطأ أثناء جلب البيانات',
          [{ text: 'حسناً' }, { text: 'إعادة المحاولة', onPress: fetchProfile }]
        );
      } finally {
        setLoading(false);
      }
    };

    // إضافة مستمع لحدث التركيز
    const unsubscribe = navigation.addListener('focus', fetchProfile);

    // التنظيف
    return unsubscribe;
  }, [navigation]);

  const toggleFavorite = (key) => {
    setFavorites((prevFavorites) => ({
      ...prevFavorites,
      [key]: !prevFavorites[key],
    }));
  };

  const renderBookingItem = (item) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        if (!item?.id) {
          Alert.alert('Error', 'Missing property ID');
          return;
        }
        // Navigate to CardDitals if the card comes from حجوزاتي
        navigation.push('CardDitals', { id: item.id });
      }}
    >
      <Image source={item.image} style={styles.cardImage} />
      <TouchableOpacity
        style={styles.Favorite}
        onPress={() => toggleFavorite(item.key)}
      >
        {/* Optionally render favorite icon here */}
      </TouchableOpacity>
      <View style={styles.cardDetails}>
        <Text style={styles.cardplace}>{item.place}</Text>
        <Text style={styles.cardcost}>
          {item.cost} {item.date}
        </Text>
        {/* <Text style={styles.cardid}>
  <Image source={item.typeimg} style={styles.typeimg} /> {item.type} : {item.id}
</Text> */}
        <Text style={styles.cardid}>
          <Image
            source={
              item.type === 'شقة' ? green :
                item.type === 'مزرعة' ? blue : yellow
            }
            style={styles.typeimg}
          />
          <Text> </Text>
          <Text style={styles.type_id}>
            {item.type} : {item.id}
          </Text>
        </Text>
        <View style={styles.rateDetails}>
          <Image source={star} style={styles.star} />
          <Text style={styles.rate}>
            {parseFloat(item.rate) === 0.0 ? '---' : parseFloat(item.rate).toFixed(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPropertyItem = (item) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        if (!item?.id) {
          Alert.alert('Error', 'Missing property ID');
          return;
        }
        // Navigate to CardDitals if the card comes from حجوزاتي
        navigation.push('CardDitalsOwner', { id: item.id });
      }}
    >
      <Image source={item.image} style={styles.cardImage} />
      <TouchableOpacity
        style={styles.Favorite}
        onPress={() => toggleFavorite(item.key)}
      >
        {/* Optionally render favorite icon here */}
      </TouchableOpacity>
      <View style={styles.cardDetails}>
        <Text style={styles.cardplace}>{item.place}</Text>
        <Text style={styles.cardcost}>
          {item.cost} {item.date}
        </Text>
        <Text style={styles.cardid}>
          <Image
            source={
              item.type === 'شقة' ? green :
                item.type === 'مزرعة' ? blue : yellow
            }
            style={styles.typeimg}
          />
          <Text> </Text>
          <Text style={styles.type_id}>
            {item.type} : {item.id}
          </Text>
        </Text>
        <View style={styles.rateDetails}>
          <Image source={star} style={styles.star} />
          <Text style={styles.rate}>{item.rate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPagination = (scrollX, length) => {
    return (
      <View style={styles.paginationContainer}>
        {Array.from({ length }).map((_, index) => {
          const inputRange = [
            (index - 1) * CARD_WIDTH,
            index * CARD_WIDTH,
            (index + 1) * CARD_WIDTH,
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
              key={index}
              style={[
                styles.paginationDot,
                { opacity, transform: [{ scale }] },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Image source={Empty} style={styles.emptyImage} />
      <Text style={styles.emptyText}>لا توجد عقارات لعرضها</Text>
    </View>
  );

  // ... rest of your component (rendering bookings and properties) ...





  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar
        style="light" // اختر "light" أو "dark" حسب خلفية التطبيق
        hidden={false} // قم بعرض أو إخفاء البار العلوي
        translucent={true} // جعل البار شفافًا إذا أردت
        backgroundColor="#4D4FFF" // لون الخلفية إذا كان غير شفاف
      />
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('gallary')}>
          <Image source={arrow} style={styles.arrowIcon} />
        </TouchableOpacity>
        <Text style={styles.title}> الملف الشخصي</Text>
      </View>
      <View style={styles.container1}>
        <View style={styles.info}>
          <View style={styles.pretext}>
            {/* Show the username and phone fetched from the DB */}
            <Text style={styles.name}>
              {profileInfo ? profileInfo.name : 'ضيف'}
            </Text>
            <Text style={styles.phoneNumber}>
              {profileInfo ? profileInfo.phone : '+963 999 999 999'}
            </Text>
          </View>
          <View style={styles.profileImagecont}>
            <Image source={MaleUser} style={styles.profileImage} />
          </View>

        </View>
        <TouchableOpacity
          style={styles.editButtoncon}
          onPress={async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              if (!token) {
                Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
                navigation.navigate('loginpage');
                return;
              }
              navigation.navigate('edit');
            } catch (error) {
              console.error('Error checking token:', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء التحقق من تسجيل الدخول');
            }
          }}
        >
          <Image source={Edit} style={styles.editicon} />
          <Text style={styles.editText}>تعديل الحساب</Text>
        </TouchableOpacity><View style={styles.line}></View>
      </View>

      {/* قسم الحجوزات مع تمرير كرت بكرت */}
      <View style={styles.bookingsContainer}>
        <Text style={styles.bookingsTitle}>حجوزاتي</Text>
        {bookingsData.length > 0 ? (
          <Animated.FlatList
            data={bookingsData}
            renderItem={({ item }) => renderBookingItem(item)}
            keyExtractor={(item) => item.key}
            horizontal
            snapToInterval={CARD_WIDTH}
            snapToAlignment="start"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: bookingScrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            contentContainerStyle={styles.cardsContainer}
          />
        ) : (
          renderEmptyState()
        )}
        {renderPagination(bookingScrollX, bookingsData.length)}
      </View>
      <View style={styles.line}></View>

      {/* قسم العقارات مع تمرير كرت بكرت */}
      <View style={styles.propertiesContainer}>
        <Text style={styles.propertiesTitle}>عقاراتي</Text>
        {propertiesData.length > 0 ? (
          <Animated.FlatList
            data={propertiesData}
            renderItem={({ item }) => renderPropertyItem(item)}
            keyExtractor={(item) => item.key}
            horizontal
            snapToInterval={CARD_WIDTH}
            snapToAlignment="start"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: propertyScrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            contentContainerStyle={styles.cardsContainer}
          />
        ) : (
          renderEmptyState()
        )}
        {renderPagination(propertyScrollX, propertiesData.length)}
      </View>
      <View style={styles.line}></View>
      <View style={styles.BackBtnContaner}>
        <TouchableOpacity
          style={styles.backButtoncon}
          onPress={() => navigation.navigate('gallary')}
        >
          <Text style={styles.backText}>رجوع</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};



const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F7F7',
    paddingTop: 20,

  },
  line: {
    height: 2,
    width: '90%',
    marginLeft: 20,
    shadowColor: 'rgba(0, 0, 0, 1)',
    backgroundColor: 'rgba(149, 147, 147, 0.69)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 5,
    shadowRadius: 10,
    elevation: 2,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  headerContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(149, 147, 147, 0.69)',
    paddingBottom: 10,
    paddingTop: 10,
    paddingRight: 10,
    paddingRight: 10,
    backgroundColor: '#4d4fff',
  },
  title: {
    fontSize: 25,
    textAlign: 'right',
    marginTop: -8,
    fontFamily: 'NotoKufiArabic-Bold',

  },
  arrowIcon: {
    width: 40,
    height: 40,
  },
  kImage: {
    width: 100,
    height: 100,

  },
  container1: {
    alignContent: 'center',
    alignItems: 'center',
  },
  info: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 20,
    paddingRight: 20,
    paddingLeft: 20,

  },
  pretext: {
    flex: 4,
  },
  profileImagecont: {},
  profileImage: {
    borderRadius: 50,
    width: 100,
    height: 100,
    tintColor: '#4d4fff',
  },
  name: {
    fontSize: 22,
    textAlign: 'right',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  phoneNumber: {
    fontSize: 17,
    color: '#666',
    textAlign: 'right',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  editButtoncon: {
    width: '70%',
    height: 'auto',
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#4D4FFF',
    borderWidth: 2,
    borderColor: '#4D4FFF',
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    fontFamily: 'NotoKufiArabic-Regular',

  },
  editText: {
    fontSize: 18,
    color: '#fff',
    display: 'flex',
    fontFamily: 'NotoKufiArabic-Regular',
    overflow: 'hidden',

  },
  editicon: {
    width: 25,
    height: 25,
    tintColor: '#fff'

  },
  bookingsContainer: {
    height: 'auto',
    marginVertical: 10,
  },
  bookingsTitle: {
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'NotoKufiArabic-Bold',
  },
  propertiesContainer: {
    height: 'auto',
  },
  propertiesTitle: {
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'NotoKufiArabic-Bold',
  },
  cardsContainer: {
    height: 'auto',
    marginTop: 15,
    paddingBottom: 5,
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  card: {
    width: 350,
    height: 'auto',
    marginBottom: 5,
    marginRight: 20,
    marginLeft: 20,
    paddingBottom: 5,
    backgroundColor: '#fff',
    shadowColor: 'rgba(0, 0, 0, 1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  Favorite: {

    position: 'absolute',
    zIndex: 2,
    margin: 5,
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  cardplace: {
    fontSize: 18,
    textAlign: 'right',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  cardcost: {
    textAlign: 'right',
    fontSize: 18,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  cardid: {
    textAlign: 'right',
  },
  rateDetails: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  star: {
    tintColor: 'gold',
    width: 35,
    height: 35,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  rate: {
    fontSize: 16,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  typeimg: {
    width: 10,
    height: 10,
    textAlign: 'right',

  },
  item_id: {
    textAlign: 'right',
    fontSize: 13,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  noProperties: {
    color: '#666',
  },
  BackBtnContaner: {
    display: 'flex',
    alignItems: 'center',
  },
  backButtoncon: {
    height: 'auto',
    width: '50%',
    paddingHorizontal: 10,
    paddingBottom: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 50,
    marginRight: 20,
    marginLeft: 20,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  backText: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',

    height: 350,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  emptyImage: {

  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: 10,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4D4FFF',
    marginHorizontal: 5,
    transitionDuration: '300ms', // لإضافة تأثير سلس (قد لا يعمل على جميع الأجهزة)
    fontFamily: 'NotoKufiArabic-Regular',
  },
});

export default ProfilePage;
