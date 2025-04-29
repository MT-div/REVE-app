import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import cancel from '@/assets/images/cancel.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';
import { useAuth } from '../src/context/AuthContext';
import arrow from '@/assets/images/arrow.png'; 
const SettingsPage = () => {
  const navigation = useNavigation();
  const [language, setLanguage] = useState('العربية');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { logout } = useAuth(); // Use the logout function from AuthContext
  // On component mount, check if an auth token exists to determine the login state.
  useEffect(() => {
    const checkAuthToken = async () => {
      const authToken = await AsyncStorage.getItem('authToken');
      setIsLoggedIn(!!authToken);
    };
    checkAuthToken();
  }, []);

  // When button is pressed, either perform logout (if user is logged in) or
  // navigate to the login page directly (if not logged in).
  const handleButtonPress = async () => {
    if (isLoggedIn) {
      try {
        // Retrieve tokens from storage
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const authToken = await AsyncStorage.getItem('authToken');

        // Corrected conditional check
        if (!refreshToken || !authToken) {
          return navigation.navigate('index');
        }

        // Call Django logout endpoint
        const response = await fetch(`${API_BASE_URL}/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (!response.ok) {
          throw new Error('Logout failed');
        }

        // **Key Change:** Instead of directly removing tokens, call the logout function from AuthContext.
        await logout();

        // Navigate to the auth screen (login or index)
        navigation.navigate('index');
      } catch (error) {
        console.error('Logout error:', error);
        Alert.alert('Error', error.message || 'Failed to logout');
      }
    } else {
      // If not logged in, simply navigate to the login page.
      navigation.navigate('loginpage');
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
       <StatusBar
        style="light" // اختر "light" أو "dark" حسب خلفية التطبيق
        hidden={false} // قم بعرض أو إخفاء البار العلوي
        translucent={true} // جعل البار شفافًا إذا أردت
        backgroundColor="#4D4FFF" // لون الخلفية إذا كان غير شفاف
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
         <View style={styles.headerContainer}>
        <TouchableOpacity           onPress={() => navigation.goBack()}
        >
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
            <Text style={styles.supportNumber}>+963 945 945 123</Text>
            <Text style={styles.supportNumber}>+963 945 123 123</Text>
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
    paddingTop:10,
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
    marginRight:20,
    marginLeft:20,
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
    marginRight:20,
    marginLeft:20,
  },
  label: {
    fontSize: 20,
    marginBottom: 5,
    textAlign: 'right',
    color: '#555',
    fontFamily: 'NotoKufiArabic-Regular',
    marginRight:20,
    marginLeft:20,
  },
  pickerContainer: {
    height: 'auto',
    borderColor: Platform.OS === 'android' ? '#ccc' : 0,
    borderWidth: Platform.OS === 'android' ? 1 : 0,
    borderRadius: 8,
    overflow: 'hidden',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  picker: {
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
    marginRight:20,
    marginLeft:20,
  },
  logoutText: {
    fontSize: 20,
    color: '#FFF',
    marginHorizontal: 10,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  cancel: {
    tintColor:'#fff',
    marginRight: 10,
    width: 24,
    height: 24,
    resizeMode: 'contain',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  cancelText: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'NotoKufiArabic-Regular',
  },
});

export default SettingsPage;
