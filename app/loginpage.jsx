

import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

import close from '@/assets/images/close.png';
import eyeClosed from '@/assets/images/eye-closed.png';
import eyeOpen from '@/assets/images/eye-open.png';
import welcom from '@/assets/images/welcom.png';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Link } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuth } from '../src/context/AuthContext';
import { API_BASE_URL } from './config/config';

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

const loginpage = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const passwordInputRef = useRef(null);
 const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async () => {
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
      setErrorMessage('يرجى ملء جميع الحقول');
      setErrorVisible(true);
      return;
    }

    setLoading(true);
    try {
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

      if (response.data.access && response.data.refresh) {
        await login({ 
          username: username.trim(),
          access: response.data.access,
          refresh: response.data.refresh
        });
        navigation.navigate('gallary');
      }
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'فشل في الاتصال بالخادم قد تكون اسم المستخدم او كلمة السر غير صحيحة';
      setErrorMessage(errorMessage);
      setErrorVisible(true);
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
      <ErrorMessageModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />

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
            <Text style={styles.loginButtonText}>اسم المستخدم او رقم الهاتف</Text>
            <TextInput
              style={[
                styles.textplace,
                usernameError && { borderColor: 'red', borderWidth: 1 },
              ]}
              value={username}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameError(false);
              }}
            />

            <Text style={styles.loginButtonText}>كلمة المرور</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                ref={passwordInputRef}
                style={[
                  styles.passwordInput,
                  passwordError && { borderColor: 'red', borderWidth: 1 },
                ]}
                autoCapitalize="none"
                secureTextEntry={!showPassword}
                value={password}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError(false);
                }}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Image
                  source={showPassword ? eyeOpen : eyeClosed}
                  style={styles.eyeIconImage}
                />
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#F7F7F7',
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
    fontSize: 16,
    color: '#000000',
    textAlign: 'right',
    marginBottom: 5,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  textplace: {
    backgroundColor: '#fff',
    fontSize: 16,
    height: 40,
    paddingHorizontal: 10,
    paddingVertical:5,
    textAlign: 'right',
    marginBottom: 15,
    borderRadius: 5,
    borderColor: '#ccc',
    borderWidth:1,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 15,
    fontSize: 16,
    textAlign:'right',
  },
  eyeIcon: {
    padding: 10,
    backgroundColor: '#fff',
    borderWidth: 0,
  },
  eyeIconImage: {
    width: 24,
    height: 24,
  },
});

export default loginpage;
