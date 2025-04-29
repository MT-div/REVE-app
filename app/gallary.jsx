import React, { useState, useEffect, useRef } from 'react';
import {
  StatusBar,
  Text,
  View,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
  Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from './config';
import { useAuth } from '../src/context/AuthContext';
import { useRoute } from '@react-navigation/native';

// Import images
import back from '@/assets/images/back.jpg';
import house2 from '@/assets/images/house2.jpg';
import search from '@/assets/images/search.png';
import Pool2 from '@/assets/images/Pool2.png';
import Home from '@/assets/images/Home.png';
import villa from '@/assets/images/villa.png';
import vil from '@/assets/images/vil.png';
import Favorite from '@/assets/images/Favorite.png';
import star from '@/assets/images/star.png';
import profile from '@/assets/images/profile.png';
import Settings from '@/assets/images/Settings.png';
import Plus from '@/assets/images/Plus.png';
import green from '@/assets/images/green.png';
import blue from '@/assets/images/blue.png';
import yellow from '@/assets/images/yellow.png';
import alarm from '@/assets/images/Alarm.png';

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
  // This flag controls if the notification icon should shake
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const route = useRoute(); // Get route parameters

  // Shaking animation when there are new notifications
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

  // Fetch real estate data along with extra query parameters if needed.
 
const fetchRealEstates = async () => {
  try {
    const params = {};

    // Add parameters from route (SearchPage)
    const searchParams = route.params || {};
    if (searchParams.property_id) params.id = searchParams.property_id;
    if (searchParams.province) params.city = searchParams.province;
    if (searchParams.area) params.region = searchParams.area;
    if (searchParams.type) params.type = searchParams.type;
    if (searchParams.minPrice) params.minprice = searchParams.minPrice;
    if (searchParams.maxPrice) params.maxprice = searchParams.maxPrice;

    // Add local parameters
    if (searchText) params.search = searchText;
    if (activeFilter !== 'all') params.type = activeFilter;

    // Remove any undefined or empty values from params.
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') delete params[key];
    });

    const config = { params, headers: {} };
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;

    const response = await axios.get(`${API_BASE_URL}/gallery/`, config);
    setRealEstates(response.data['real estates']);
    
    // Update hasNewNotifications based on backend response
    console.log("heree 222");

    console.log("User token: ", user?.token);

    setHasNewNotifications(response.data.has_unseen_notifications === 1);
    
    setError(null);
  } catch (error) {
    setError('فشل في تحميل البيانات');
    Alert.alert('خطأ', 'تعذر الاتصال بالخادم');
  } finally {
    setLoading(false);
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

  // Toggle favorite status
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
      Alert.alert('خطأ', 'فشل في تحديث المفضلة');
    }
  };

  // Search handler with delay (if needed)
  const handleSearch = () => {
    fetchRealEstates(searchText, activeFilter);
  };

  // Filter change handler
  const handleFilterPress = (filter) => {
    setActiveFilter(filter);
    fetchRealEstates(searchText, filter);
  };

  // Function to fetch notifications and mark them as seen.
  const fetchNotifications = async () => {
    if (!user?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // Calling the API that marks notifications as seen.
      await axios.get(`${API_BASE_URL}/get_notifications/`, config);
      // When the notifications endpoint is accessed,
      // all unseen notifications are marked as seen in the backend.
      // Now update the state to stop the shaking effect.
      setHasNewNotifications(false);
      // Optionally, navigate to a Notifications screen:
      navigation.navigate('NotificationsPage');
    } catch (error) {
      console.log('Error fetching notifications:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        if (!item?.id) {
          Alert.alert('Error', 'Missing property ID');
          return;
        }
        navigation.navigate('CardDitals', { id: item.id });
      }}
    >
      <Image
        source={{ uri: item.photo || house2 }}
        style={styles.cardImage}
        defaultSource={house2}
      />
      <TouchableOpacity
        style={styles.Favorite}
        onPress={() => {
          if (!user) return;
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
          {item.price}$ {item.period}
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
          <Text style={styles.rate}>{parseFloat(item.ratings).toFixed(1)}</Text>
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

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchRealEstates()}
        >
          <Text style={styles.retryText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (

    <View style={styles.container}>
      <StatusBar
        style="light" // اختر "light" أو "dark" حسب خلفية التطبيق
        hidden={false} // قم بعرض أو إخفاء البار العلوي
        translucent={true} // جعل البار شفافًا إذا أردت
        backgroundColor="#4D4FFF" // لون الخلفية إذا كان غير شفاف
      />
      <View style={styles.searchcontainer}>
        <View style={styles.searchalarmcontainer}>

          < TouchableOpacity style={styles.alarmButton} onPress={() => navigation.navigate('notifications')}>
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

      <FlatList
        data={realEstates}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={{  width: '100%', // تأكد من أن الحاوية تأخذ العرض الكامل
          height: 'auto',
          paddingTop: 20,
          marginBottom: 68,
          backgroundColor: '#F7F7F7',
          }}
          
        ListEmptyComponent={
          <Text style={styles.noResults}>لا توجد عقارات متاحة</Text>
        }
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomBar}>
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
    paddingTop: 35,

  },
  searchalarmcontainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 5,
  },
  searchBar: {
    width: '80%',
    height: 55,
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
    position: 'relative', // أضف هذا
    width: 50,
    height: 55,
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
    right: -5,  // قلل المسافة من الحافة
    top: -5,   // قلل المسافة من الأعلى
    backgroundColor: 'red',
    borderRadius: 6,  // زاد حجم نصف القطر
    width: 10,       // زاد الحجم قليلاً
    height: 10,
    zIndex: 2,       // تأكد أنها فوق 
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
  noResults: {
    fontSize: 16,
    fontFamily: 'NotoKufiArabic-Regular',
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
    width: '100%', // تأكد من أن الحاوية تأخذ العرض الكامل
    height: 'auto',
    marginTop: 22,
    paddingBottom: 80,
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    marginLeft:-40,
  },
  card: {
    width: '90%', // 90% من عرض الحاوية الأم
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
    alignSelf: 'center',    // لمحاذاة العنصر بشكل منفرد في المركز
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
    height: 68,
    backgroundColor: '#4D4FFF',
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    direction:'ltr',
  },
  bottomBarButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',

  },
  bottomBarText: {
    fontSize: 9,
    color: '#fff',
    fontFamily: 'NotoKufiArabic-Regular',

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
});

export default Gallary;

