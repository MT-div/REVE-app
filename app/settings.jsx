
import arrow from '@/assets/images/arrow.png';
import cancel from '@/assets/images/cancel.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  FlatList
} from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { API_BASE_URL } from './config/config';
import axios from 'axios';

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
            <View style={styles.errorModalButtons}>
              <TouchableOpacity
                style={styles.errorModalButton}
                onPress={onClose}
              >
                <Text style={styles.errorModalButtonText}>موافق</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const SettingsPage = () => {
  const navigation = useNavigation();
  const [language, setLanguage] = useState('العربية');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { logout } = useAuth();
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  useEffect(() => {
    const formatPhoneNumber = (phone) => {
  if (!phone) return 'لا يوجد رقم';

  // إضافة رمز "+" في البداية
  const formatted = phone.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return `+${formatted}`;
};

const fetchPhoneNumbers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/phones_admins/`);

    // معالجة الأرقام وتنسيقها
    const formattedNumbers = response.data.phons?.map((phone) => ({
      key: `phone-${phone.phone}`,
      number: formatPhoneNumber(phone.phone), // تحويل الرقم إلى الشكل المطلوب
    })) || [];

    setPhoneNumbers(formattedNumbers);
  } catch (error) {
    console.warn('فشل في جلب الأرقام:', error);
  }
};

    fetchPhoneNumbers();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.phoneContainer}>
      <Text style={styles.supportName}>{item.name}</Text>
      <Text style={styles.supportNumber}>{item.number}</Text>
    </View>
  );

  useEffect(() => {
    const checkAuthToken = async () => {
      const authToken = await AsyncStorage.getItem('authToken');
      setIsLoggedIn(!!authToken);
    };
    checkAuthToken();
  }, []);

  const handleButtonPress = async () => {
    if (isLoggedIn) {
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const authToken = await AsyncStorage.getItem('authToken');

        if (!refreshToken || !authToken) {
          return navigation.navigate('index');
        }

        const response = await fetch(`${API_BASE_URL}/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (!response.ok) {
          throw new Error('فشل تسجيل الخروج');
        }

        await logout();
        navigation.navigate('index');
      } catch (error) {
        console.error('Logout error:', error);
        setErrorMessage(error.message || 'فشل في تسجيل الخروج');
        setErrorVisible(true);
      }
    } else {
      navigation.navigate('loginpage');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        style="light"
        hidden={false}
        translucent={true}
        backgroundColor="#4D4FFF"
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={arrow} style={styles.arrowIcon} />
          </TouchableOpacity>
          <Text style={styles.title}> الإعدادات</Text>
        </View>

        <View style={styles.section1}>
          <Text style={styles.label}>اللغة</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={language}
              style={styles.picker}
              mode="dropdown"
              dropdownIconColor="#4D4FFF"
              itemStyle={styles.language1}
              onValueChange={(itemValue) => setLanguage(itemValue)}
            >
              <Picker.Item label="العربية" value="العربية" />
            </Picker>
          </View>
        </View>

        <Text style={styles.label}>المساعدة والدعم</Text>
        <View style={styles.section2}>
          <Text style={styles.supportText}>التواصل على الأرقام:</Text>
          <View style={styles.nums}>
            {phoneNumbers.length > 0 ? (
              <FlatList
                data={phoneNumbers}
                renderItem={renderItem}
                keyExtractor={(item) => item.key}
              />
            ) : (
              <Text style={styles.emptyText}>لم يتم العثور على أرقام دعم</Text>
            )}
          </View>

        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleButtonPress}
        >
          <Image source={cancel} style={styles.cancel} />
          <Text style={styles.logoutText}>
            {isLoggedIn ? 'تسجيل الخروج' : 'تسجيل الدخول'}
          </Text>
        </TouchableOpacity>

        <ErrorMessageModal
          visible={errorVisible}
          message={errorMessage}
          onClose={() => setErrorVisible(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 20,
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
  section1: {
    marginBottom: 30,
    borderRadius: 5,
    marginRight: 20,
    marginLeft: 20,
  },
  section2: {
    marginTop: 10,
    marginBottom: 30,
    backgroundColor: '#E0E0E0',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginRight: 20,
    marginLeft: 20,
  },
  label: {
    fontSize: 20,
    marginBottom: 5,
    textAlign: 'right',
    color: '#555',
    fontFamily: 'NotoKufiArabic-Regular',
    marginRight: 20,
    marginLeft: 20,
  },
  pickerContainer: {
    height: 'auto',
    borderColor: Platform.OS === 'android' ? '#ccc' : 0,
    borderWidth: Platform.OS === 'android' ? 1 : 0,
    borderRadius: 8,
    overflow: 'hidden',
    fontFamily: 'NotoKufiArabic-Regular',
    textAlign: 'right',
  },
  picker: {
    direction: 'rtl',
    height: 'auto',
    width: '100%',
    textAlign: 'right',
    backgroundColor: '#fff',
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#000',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  language1: {
    fontSize: 16,
    color: Platform.OS === 'android' ? '#000' : '#000',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  supportText: {
    fontSize: 18,
    textAlign: 'right',
    color: '#444',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  nums: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding: 10,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  supportNumber: {
    fontSize: 18,
    textAlign: 'right',
    color: '#333',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4D4FFF',
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    marginRight: 20,
    marginLeft: 20,
  },
  logoutText: {
    fontSize: 20,
    color: '#FFF',
    marginHorizontal: 10,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  cancel: {
    tintColor: '#fff',
    marginRight: 10,
    width: 24,
    height: 24,
    resizeMode: 'contain',
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
  errorModalButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    width: '100%',
    marginTop: 15,
  },
  errorModalButton: {
    backgroundColor: '#4D4FFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  errorModalButtonText: {
    color: '#fff',
    fontFamily: 'NotoKufiArabic-Bold',
    fontSize: 16,
  },

});

export default SettingsPage;