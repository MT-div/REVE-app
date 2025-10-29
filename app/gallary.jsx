
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
  handleRefresh,
  RefreshControl
} from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { API_BASE_URL } from './config/config';

// Import images
import alarm from '@/assets/images/Alarm.png';
import blue from '@/assets/images/blue.png';
import Favorite from '@/assets/images/Favorite.png';
import green from '@/assets/images/green.png';
import Home from '@/assets/images/Home.png';
import house2 from '@/assets/images/house2.jpg';
import Plus from '@/assets/images/Plus.png';
import Pool2 from '@/assets/images/Pool2.png';
import profile from '@/assets/images/profile.png';
import search from '@/assets/images/search.png';
import Settings from '@/assets/images/Settings.png';
import star from '@/assets/images/star.png';
import vil from '@/assets/images/vil.png';
import villa from '@/assets/images/villa.png';
import yellow from '@/assets/images/yellow.png';
import AsyncStorage from '@react-native-async-storage/async-storage'; // أضف هذا الاستيراد

const ErrorMessageModal = ({ visible, message, onClose, onRetry }) => {
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

const Gallary = () => {
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const { user } = useAuth();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchIconAnimation = useRef(new Animated.Value(0)).current;
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [realEstates, setRealEstates] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const route = useRoute();
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let interval;
    if (hasNewNotifications) {
      startShake();
      interval = setInterval(async () => {
        await startShake();
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasNewNotifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotificationsOnly();
    }, 30000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRealEstates();
    });
    return unsubscribe;
  }, [navigation]);

  const startShake = () => {
    return new Promise((resolve) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnimation, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnimation, {
            toValue: -1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnimation, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 }
      ).start(() => resolve());
    });
  };

  const checkForNewNotifications = async () => {
    try {
      const config = { headers: {} };
      if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;

      const response = await axios.get(`${API_BASE_URL}/gallery/`, config);
      setHasNewNotifications(response.data.has_unseen_notifications === 1);
    } catch (error) {

    }
  };

const fetchRealEstates = async () => {
  try {
    const params = {};

    // ✅ إعادة إضافة الفلترة والبحث
    if (searchText && searchText.trim() !== '') params.search = searchText;
    if (activeFilter && activeFilter !== 'all') params.type = activeFilter;

    // إزالة المعايير غير الصالحة
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') delete params[key];
    });

    const config = { params, headers: {} };
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;

    const response = await axios.get(`${API_BASE_URL}/gallery/`, config);
    const realEstatesData = response.data['real estates'];

    // ✅ حفظ البيانات المخزنة مع المعايير المطبقة
    await AsyncStorage.setItem('cachedRealEstates', JSON.stringify({
      data: realEstatesData,
      params, // حفظ المعايير
      timestamp: new Date().getTime()
    }));

    setRealEstates(realEstatesData);
    setError(null);
    setErrorVisible(false);
    setIsOffline(false);
  } catch (error) {
    try {
      const cachedData = await AsyncStorage.getItem('cachedRealEstates');
      if (cachedData) {
        const { data, params: cachedParams, timestamp } = JSON.parse(cachedData);

        // ✅ التحقق من تطابق البيانات المخزنة مع معايير البحث الحالية
        if (new Date().getTime() - timestamp < 7 * 24 * 60 * 60 * 1000) {
          if (JSON.stringify(params) === JSON.stringify(cachedParams)) {
            setRealEstates(data);
            setIsOffline(true);
            return;
          }
        }
      }

      // إذا لم توجد بيانات مطابقة
      setError('فشل في تحميل البيانات');
      setErrorMessage('تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى');
      setErrorVisible(true);
    } catch (cacheError) {
      setError('فشل في تحميل البيانات');
      setErrorMessage('تعذر الاتصال بالخادم ولا توجد بيانات مخزنة');
      setErrorVisible(true);
    }
  } finally {
    setLoading(false);
  }
};

 const handleCardPress = (item) => {
  // التحقق من وجود معرف العقار أولاً
  if (!item?.id) {
    setErrorMessage('معرف العقار مفقود');
    setErrorVisible(true);
    return;
  }
const handleRefresh = async () => {
  try {
    setRefreshing(true);
    await fetchRealEstates(); // استدعاء الدالة التي تجلب البيانات
  } catch (error) {
    setErrorMessage('فشل في تحديث البيانات');
    setErrorVisible(true);
  } finally {
    setRefreshing(false);
  }
};
  // التحقق من حالة الاتصال بالإنترنت
  if (isOffline) {
    Alert.alert(
      "لا يوجد اتصال بالإنترنت",
      "لا يمكنك رؤية تفاصيل العقار إلا إذا كنت متصلاً بالإنترنت",
      [
        { 
          text: "موافق", 
          style: "cancel" 
        }
      ]
    );
    return;
  }

  // إذا كل الشروط مطابقة، الانتقال لصفحة التفاصيل
  navigation.navigate('CardDitals', { id: item.id });
};



  // دالة مستقلة لجلب حالة الإشعارات فقط
  const fetchNotificationsOnly = async () => {
    try {
      const config = { headers: {} };
      if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;

      const response = await axios.get(`${API_BASE_URL}/gallery/`, config);
      setHasNewNotifications(response.data.has_unseen_notifications === 1);
    } catch (error) {
      console.warn('فشل في جلب الإشعارات:', error);
    }
  };

  useEffect(() => {
    fetchRealEstates();
  }, [route.params, searchText, activeFilter]);

  useEffect(() => {
    Animated.timing(searchIconAnimation, {
      toValue: isSearchActive ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSearchActive]);

  useEffect(() => {
    setIsSearchActive(searchText.length > 0);
  }, [searchText]);

  const toggleFavorite = async (realestateId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/toggle-favorite/${realestateId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        }
      );

      setRealEstates(prev => prev.map(item =>
        item.id === realestateId
          ? { ...item, is_favorite: response.data.is_favorite }
          : item
      ));
    } catch (error) {
      setErrorMessage('فشل في تحديث المفضلة');
      setErrorVisible(true);
    }
  };

  const handleSearch = () => {
    fetchRealEstates(searchText, activeFilter);
  };

  const handleFilterPress = (filter) => {
    setActiveFilter(filter);
    fetchRealEstates(searchText, filter);
  };

  const fetchNotifications = async () => {
    if (!user?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.get(`${API_BASE_URL}/get_notifications/`, config);
      setHasNewNotifications(false);
      navigation.navigate('NotificationsPage');
    } catch (error) {

    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleCardPress(item)}
    >
      <Image
        source={item.photo && item.photo.trim() !== "" ? { uri: item.photo } : house2} style={styles.cardImage}
        defaultSource={house2}
      />
      <TouchableOpacity
        style={styles.Favorite}
        onPress={() => {
          if (!user) {
            setErrorMessage('يجب تسجيل الدخول أولاً');
            setErrorVisible(true);
            return;
          }
          toggleFavorite(item.id);
        }}
      >
        <Image
          source={Favorite}
          style={[
            styles.favoriteIcon,
            {
              tintColor: user ? (item.is_favorite ? 'red' : '#444') : '#444',
            },
          ]}
        />
      </TouchableOpacity>

      <View style={styles.cardDetails}>
        <Text style={styles.cardplace}>{item.city} - {item.town}</Text>
        <Text style={styles.cardcost}>
          {item.price_with_benefit}$ {item.period}
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
          <Text style={styles.rate}>
            {parseFloat(item.ratings) === 0.0 ? '---' : parseFloat(item.ratings).toFixed(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D4FFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
       
      <ErrorMessageModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
        onRetry={fetchRealEstates}
      />

      <StatusBar
        style="light"
        hidden={false}
        translucent={true}
        backgroundColor="#4D4FFF"
      />
      {/* إضافة مؤشر حالة الاتصال */}
    
      <View style={styles.searchcontainer}>
        
        <View style={styles.searchalarmcontainer}>
          <TouchableOpacity style={styles.alarmButton} onPress={() => {
    if (isOffline) {
      Alert.alert(
        "لا يوجد اتصال بالإنترنت",
        "لا يمكنك رؤية الإشعارات إلا إذا كنت متصلاً بالإنترنت",
        [
          { 
            text: "موافق", 
            style: "cancel" 
          }
        ]
      );
    } else {
      navigation.navigate('notifications');
    }
  }}
>
            <Animated.View
              style={[
                {
                  transform: [{
                    rotate: shakeAnimation.interpolate({
                      inputRange: [-1, 1],
                      outputRange: ['-5deg', '5deg'],
                    })
                  }]
                }]}
            >
              <Image source={alarm} style={styles.alarmIcon} />
              {hasNewNotifications && <View style={styles.notificationBadge} />}
            </Animated.View>
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Animated.Image
                source={search}
                style={[
                  styles.searchIcon,
                  {
                    tintColor: searchIconAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['#444', '#4D4FFF']
                    }),
                    transform: [{
                      scale: searchIconAnimation.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1.2, 1]
                      })
                    }]
                  }
                ]}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder=" ابحث عن اسم منطقة او ID ..."
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
            />
          </View>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => handleFilterPress('مزرعة')}
          >
            <Image
              source={Pool2}
              style={[
                styles.Pool2,
                activeFilter === 'مزرعة' && { tintColor: '#4D4FFF' }
              ]}
            />
            <Text
              style={[
                styles.filterText,
                activeFilter === 'مزرعة' && { color: '#4D4FFF' }
              ]}
            >
              مزارع
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => handleFilterPress('شقة')}
          >
            <Image
              source={Home}
              style={[
                styles.Home,
                activeFilter === 'شقة' && { tintColor: '#4D4FFF' }
              ]}
            />
            <Text
              style={[
                styles.filterText,
                activeFilter === 'شقة' && { color: '#4D4FFF' }
              ]}
            >
              شقق
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => handleFilterPress('فيلّا')}
          >
            <Image
              source={villa}
              style={[
                styles.villa,
                activeFilter === 'فيلّا' && { tintColor: '#4D4FFF' }
              ]}
            />
            <Text
              style={[
                styles.filterText,
                activeFilter === 'فيلّا' && { color: '#4D4FFF' }
              ]}
            >
              فيلات
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => handleFilterPress('all')}
          >
            <Image
              source={vil}
              style={[
                styles.vil,
                activeFilter === 'all' && { tintColor: '#4D4FFF' }
              ]}
            />
            <Text
              style={[
                styles.filterText,
                activeFilter === 'all' && { color: '#4D4FFF' }
              ]}
            >
              الكل
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.line} />
      </View>

      {error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={realEstates}
          renderItem={renderItem}
          initialNumToRender={5} // تقليل عدد العناصر المبدئية

          keyExtractor={(item) => item.id.toString()}
          style={{
            width: '100%',
            height: 'auto',
            paddingTop: 20,
            marginBottom: 60,
            backgroundColor: '#F7F7F7',
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا توجد عقارات متاحة</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
           refreshing={refreshing} // حالة التحديث
  onRefresh={handleRefresh} // دالة التحديث عند السحب
   refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      colors={['#4D4FFF']} // لون مؤشر التحميل
      tintColor="#4D4FFF" // لون المؤشر (لـ iOS)
    />
  }
        />
      )}
 
      <View style={styles.bottomBar}>
         {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>لايتوفر اتصال بالانترنت</Text>
        </View>
      )}
        <TouchableOpacity style={styles.bottomBarButton} onPress={() => navigation.navigate('profile')}>
          <Image source={profile} style={styles.profile} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomBarButton} onPress={() => navigation.navigate('settings')}>
          <Image source={Settings} style={styles.Settings} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomBarButton} onPress={() => navigation.navigate('reg')}>
          <Image source={Plus} style={styles.Plus} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomBarButton} onPress={() => navigation.navigate('search')}>
          <Image source={search} style={styles.search2} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomBarButton} onPress={() => navigation.navigate('favoritepage')}>
          <Image source={Favorite} style={styles.Favorite2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  searchcontainer: {
    display: 'flex',
    height: 'auto',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 40,
  },
  searchalarmcontainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 5,
  },
  searchBar: {
    width: '80%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#4D4FFF',
    paddingHorizontal: 5,
    backgroundColor: '#fff',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    fontFmily: 'NotoKufiArabic-Regular',
    paddingVertical: 0.7,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    backgroundColor: '#fff',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  searchIcon: {
    width: 25,
    height: 25,
  },
  alarmButton: {
    position: 'relative',
    width: 50,
    height: 50,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'NotoKufiArabic-Regular',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#4D4FFF',
    paddingHorizontal: 5,
    backgroundColor: '#fff',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  alarmIcon: {
    width: 25,
    height: 25,
    color: '4D4FFF',
    tintColor: '#4D4FFF'
  },
  notificationBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 6,
    width: 10,
    height: 10,
    zIndex: 2,
  },
  filterContainer: {
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'row',
    margin: 15,
  },
  filterButton: {
    width: 50,
    height: 50,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 150,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'NotoKufiArabic-Regular',
    color: '#666',
  },
  vil: {
    width: 40,
    height: 40,
  },
  villa: {
    width: 40,
    height: 40,
  },
  Pool2: {
    width: 40,
    height: 40,
  },
  Home: {
    width: 40,
    height: 40,
  },
  line: {
    height: 2,
    width: 500,
    backgroundColor: 'rgba(149, 147, 147, 0.69)',
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
  },
  cardsContainer: {
    width: '100%',
    height: 'auto',
    marginTop: 22,
    paddingBottom: 80,
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    marginLeft: -40,
  },
  card: {
    width: '90%',
    height: 'auto',
    marginBottom: 30,
    paddingBottom: 5,
    backgroundColor: '#fff',
    shadowColor: 'rgba(0, 0, 0, 1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    alignSelf: 'center',
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
    paddingHorizontal: 10
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
    fontFamily: 'NotoKufiArabic-Regular',
  },
  star: {
    width: 35,
    height: 35,
    fontFamily: 'NotoKufiArabic-Regular',
    tintColor: 'gold'
  },
  rate: {
    fontSize: 18,
    fontFamily: 'NotoKufiArabic-Regular',
  },

  typeimg: {
    width: 9,
    height: 9,
    textAlign: 'right',
  },
  item_id: {
    textAlign: 'right',
    fontSize: 13,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#4D4FFF',
    flexDirection: (require('react-native').I18nManager?.isRTL) ? 'row' : 'row-reverse', justifyContent: 'space-around',
    alignItems: 'center',

  },
  bottomBarButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profile: {},
  Settings: {},
  Favorite2: {},
  Plus: {
    height: 40,
  },
  search2: {
    height: 40,
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
  offlineBanner: {
    backgroundColor: '#FFC107',
    padding: 10,
    height:60,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex:1,
  },
  offlineText: {
    color: '#333',
    fontWeight: 'bold',
  },
  refreshIndicator: {
    color: '#4D4FFF',
  },
});

export default Gallary;