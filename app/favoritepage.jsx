import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Image, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../src/context/AuthContext';
import {StatusBar} from 'react-native';
import back from '@/assets/images/back.jpg';
import house2 from '@/assets/images/house2.jpg';
import arrow from '@/assets/images/arrow.png'; // استيراد صورة السهم
import Favorite from '@/assets/images/Favorite.png';
import star from '@/assets/images/star.png';
import green from '@/assets/images/green.png';
import blue from '@/assets/images/blue.png';
import yellow from '@/assets/images/yellow.png';
import { API_BASE_URL } from './config';

// Use your server’s URL from settings

// const API_BASE_URL = 'http://amrnamora.pythonanywhere.com';
// const API_BASE_URL = 'http://192.168.1.102:8000';

const HomePage = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // This state will hold the list of favorite real estates (with details)
  const [favorites, setFavorites] = useState([]);

  // Map a full real estate object (as returned by RealEstateSerializer) into your UI’s expected structure.
  const mapRealestate = (realestate) => {
    let typeimg;
    if (realestate.type === 'شقة') {
      typeimg = green;
    } else if (realestate.type === 'مزرعة') {
      typeimg = blue;
    } else if (realestate.type === 'فيلا') {
      typeimg = yellow;
    } else {
      typeimg = green;
    }
    return {
      key: realestate.id.toString(),
      place: `${realestate.city}-${realestate.town}`,
      cost: `${realestate.price}$`,
      rate: realestate.ratings,
      date: realestate.period,
      type: realestate.type,
      id: realestate.id,
      image: realestate.photo ? { uri: realestate.photo } : house2,
      typeimg: typeimg,
    };
  };

  // If the favourite serializer returns only an ID for realestate,
  // fetch its full details. We call the gallery endpoint with a filter.
  const fetchRealestateDetails = async (realestateId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/gallery/`, {
        headers: { Authorization: `Bearer ${user.token}` },
        params: { id: realestateId }  // Assuming your RealEstateFilter supports filtering by id.
      });
      // Expecting response to be in the format: { "real estates": [ { ... } ] }
      if (response.data['real estates'] && response.data['real estates'].length > 0) {
        return response.data['real estates'][0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching real estate details:', error);
      return null;
    }
  };

  // Fetch the current user’s favorites.
  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/favourit/`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      // Expected response format: { "your favourites": [ { ... }, { ... }, ... ] }
      const favList = response.data['your favourites'];
      const detailedFavorites = await Promise.all(
        favList.map(async (fav) => {
          // If fav.realestate is already an object, use it.
          if (typeof fav.realestate === 'object' && fav.realestate !== null) {
            return mapRealestate(fav.realestate);
          } else {
            // Otherwise, assume it’s an ID and fetch details.
            const details = await fetchRealestateDetails(fav.realestate);
            return details ? mapRealestate(details) : null;
          }
        })
      );
      // Remove null entries (in cases where fetching details failed)
      setFavorites(detailedFavorites.filter((item) => item !== null));
    } catch (error) {
      console.error('Error fetching favorites:', error);
      Alert.alert('Error', 'Unable to fetch favorites from the backend.');
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  // When the user taps the favorite icon, confirm removal,
  // then call your toggle endpoint and remove it from the state.
  const toggleFavorite = (key) => {
    Alert.alert(
      "تأكيد",
      "هل تريد بالتأكيد إزالة هذا العقار من المفضلة؟",
      [
        {
          text: "إلغاء",
          style: "cancel"
        },
        {
          text: "نعم",
          onPress: async () => {
            try {
              await axios.post(
                `${API_BASE_URL}/toggle-favorite/${key}/`,
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
              );
              setFavorites(prev => prev.filter(item => item.key !== key));
            } catch (error) {
              console.error('Error toggling favorite:', error);
              Alert.alert('Error', 'Unable to remove the favorite.');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}
    onPress={() => {
            console.log('1            1')
            if (!item?.id) {
              Alert.alert('Error', 'Missing property ID');
              return;
            }
            console.log(item.id)
            navigation.navigate('CardDitals', { id: item.id })
          }}
    >
      <Image source={item.image} style={styles.cardImage} />
      <TouchableOpacity
        style={styles.Favorite}
        onPress={() => toggleFavorite(item.key)}
      >
        <Image
          source={Favorite}
          style={[styles.favoriteIcon, { tintColor: 'red' }]}
        />
      </TouchableOpacity>
      <View style={styles.cardDetails}>
        <Text style={styles.cardplace}>{item.place}</Text>
        <Text style={styles.cardcost}>{item.cost} {item.date}</Text>
        <Text style={styles.cardid}>
          <Image
            source={
              item.type === 'شقة' ? green :
                item.type === 'مزرعة' ? blue : yellow
            }
            style={styles.typeimg}
          />
          <Text> </Text>
          <Text style={styles.item_id}>
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

  return (
    <View style={styles.container}>
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
        <Text style={styles.title}>قائمة المفضلة</Text>
      </View>

      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        style={{  width: '100%', // تأكد من أن الحاوية تأخذ العرض الكامل
          height: 'auto',
          backgroundColor: '#F7F7F7',
          paddingTop:20,
          }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  
  headerContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(149, 147, 147, 0.69)',
    paddingBottom: 10,
    paddingTop:30,
backgroundColor:'#4D4FFF',

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
  cardsContainer: {
    height: 'auto',
    marginTop: 22,
    paddingBottom: 10,
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    marginRight:20,
    marginLeft:20,
  },
  card: {

    width: '90%',
    height: 'auto',
    marginBottom: 30,
    marginRight: 20,
    marginLeft: 20,
    paddingBottom:5,
    backgroundColor: '#fff',
    shadowColor: 'rgba(0, 0, 0, 1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    alignSelf:'center',
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
});

export default HomePage;