

import arrow from '@/assets/images/arrow.png';
import blue from '@/assets/images/blue.png';
import Favorite from '@/assets/images/Favorite.png';
import green from '@/assets/images/green.png';
import house2 from '@/assets/images/house2.jpg';
import star from '@/assets/images/star.png';
import yellow from '@/assets/images/yellow.png';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FlatList, Image, Modal, StatusBar, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { API_BASE_URL } from './config/config';

const ErrorMessageModal = ({ visible, message, onClose, onConfirm }) => {
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
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.errorModalButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.errorModalButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.errorModalButton}
                onPress={onConfirm}
              >
                <Text style={styles.errorModalButtonText}>تأكيد</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const favoritepage = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState(null);

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

  const fetchRealestateDetails = async (realestateId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/gallery/`, {
        headers: { Authorization: `Bearer ${user.token}` },
        params: { id: realestateId }
      });
      if (response.data['real estates'] && response.data['real estates'].length > 0) {
        return response.data['real estates'][0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching real estate details:', error);
      return null;
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/favourit/`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const favList = response.data['your favourites'];
      const detailedFavorites = await Promise.all(
        favList.map(async (fav) => {
          if (typeof fav.realestate === 'object' && fav.realestate !== null) {
            return mapRealestate(fav.realestate);
          } else {
            const details = await fetchRealestateDetails(fav.realestate);
            return details ? mapRealestate(details) : null;
          }
        })
      );
      setFavorites(detailedFavorites.filter((item) => item !== null));
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setErrorMessage('تعذر جلب العناصر المفضلة من الخادم');
      setErrorVisible(true);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const toggleFavorite = (key) => {
    setSelectedFavorite(key);
    setErrorMessage("هل تريد بالتأكيد إزالة هذا العقار من المفضلة؟");
    setErrorVisible(true);
  };

  const handleConfirmRemoval = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/toggle-favorite/${selectedFavorite}/`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setFavorites(prev => prev.filter(item => item.key !== selectedFavorite));
      setErrorVisible(false);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setErrorMessage('تعذر إزالة العنصر من المفضلة');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}
    onPress={() => {
            if (!item?.id) {
              setErrorMessage('معرف العقار مفقود');
              setErrorVisible(true);
              return;
            }
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
             <Text style={styles.rate}>
            {parseFloat(item.rate) === 0.0 ? '---' : parseFloat(item.rate).toFixed(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ErrorMessageModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
        onConfirm={handleConfirmRemoval}
      />
      <StatusBar
        style="light"
        hidden={false}
        translucent={true}
        backgroundColor="#4D4FFF"
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
        style={{  
          width: '100%',
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
    paddingRight:10,
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
    tintColor:'gold',
    width: 35,
    height: 35,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  rate: {
    fontSize: 16,
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
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  errorModalButton: {
    backgroundColor: '#4D4FFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 30,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    borderWidth:1,
    borderColor:'#ccc',
  },
  errorModalButtonText: {
    color:'#000',

    fontFamily: 'NotoKufiArabic-Bold',
    fontSize: 16,
  },
});

export default favoritepage;