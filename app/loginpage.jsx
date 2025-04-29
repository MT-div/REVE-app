
import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';

import { Link } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import { useAuth } from '../src/context/AuthContext';
import welcom from '@/assets/images/welcom.png';
import close from '@/assets/images/close.png';
import { API_BASE_URL } from './config';
const HomePage = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordInputRef = useRef(null);

  const handleSubmit = async () => {
    // Validation logic
    let hasError = false;
    if (!username.trim()) {
      setUsernameError(true);
      hasError = true;
    }
    if (!password.trim()) {
      setPasswordError(true);
      hasError = true;
    }
    if (hasError) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }

    setLoading(true);
    try {
      // API call
      const response = await axios.post(
        `${API_BASE_URL}/account/token/`,
        {
          username: username.trim(),
          password: password.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Handle successful login
      if (response.data.access && response.data.refresh) {
        await login({ 
          username: username.trim(),
          access: response.data.access,    // Correct key for the access token
          refresh: response.data.refresh   // Pass the refresh token as well
        });
        navigation.navigate('gallary');
      }
      
    } catch (error) {
      // Error handling
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.detail || 'فشل في الاتصال بالخادم';
      Alert.alert('خطأ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      <TouchableOpacity
                style={styles.closeButton}
                onPress={() => navigation.navigate('index')}
              >
                <Image source={close} style={styles.closeimg} />
              </TouchableOpacity>
            
      <View style={styles.logocontainer}>
        <Image source={welcom} style={styles.logo} />
      </View>

      <View style={styles.every}>
        <View style={styles.formm}>
          <View style={styles.input}>
            <Text style={styles.loginButtonText}>اسم المستخدم</Text>
            <TextInput
              style={[
                styles.textplace,
                usernameError && { borderColor: 'red', borderWidth: 1 },
              ]}
              value={username}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameError(false);
              }}
            />

            <Text style={styles.loginButtonText}>كلمة المرور</Text>
            <TextInput
              ref={passwordInputRef}
              style={[
                styles.textplace,
                passwordError && { borderColor: 'red', borderWidth: 1 },
              ]}
              secureTextEntry={true}
              value={password}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError(false);
              }}
            />
          </View>

          <View style={styles.nothavecontainer}>
            <Text style={styles.nothave}>أليس لديك حساب؟ </Text>
            <Link href="/signupPerson" style={styles.new}>
              انشئ حساب
            </Link>
          </View>

          <View style={styles.confcont}>
            <TouchableOpacity 
              style={styles.conf} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.confText}>تأكيد</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 50,
    justifyContent: 'space-between',
  },
  logocontainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: '90%',
  },
  every: {
    alignItems: 'center',
    flex: 1,
  },
  formm: {
    width: '100%',
  },
  input: {
    marginBottom: 20,
  },
  loginButtonText: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'right',
    marginBottom: 5,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  textplace: {
    backgroundColor: '#D9D9D9',
    fontSize: 16,
    height: 40,
    paddingHorizontal: 10,
    paddingVertical:5,
    textAlign: 'right',
    marginBottom: 15,
    borderRadius: 5,

  },
  nothavecontainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  nothave: {
    fontSize: 16,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  new: {
    textDecorationLine: 'underline',
    color: '#4D4FFF',
    fontSize: 16,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  confcont: {
    alignItems: 'center',
    marginTop: 20,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  conf: {
    width: 240,
    height: 55,
    backgroundColor: '#4D4FFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.45)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  confText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'NotoKufiArabic-Regular',
  },
});

export default HomePage;

