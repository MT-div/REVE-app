
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import cancel from '@/assets/images/cancel.png';
import eyeClosed from '@/assets/images/eye-closed.png';
import eyeOpen from '@/assets/images/eye-open.png';
import next from '@/assets/images/next.png';
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

const GOVERNORATES_OPTIONS = [
  { label: 'خارج سوريا', value: 'خارج سوريا' },
  { label: 'ادلب', value: 'ادلب' },
  { label: 'دمشق', value: 'دمشق' },
  { label: 'حلب', value: 'حلب' },
  { label: 'ريف دمشق', value: 'ريف دمشق' },
  { label: 'حماه', value: 'حماه' },
  { label: 'حمص', value: 'حمص' },
  { label: 'درعا', value: 'درعا' },
  { label: 'القنيطرة', value: 'القنيطرة' },
  { label: 'السويداء', value: 'السويداء' },
  { label: 'دير الزور', value: 'دير الزور' },
  { label: 'رقه', value: 'رقه' },
  { label: 'الحسكة', value: 'الحسكة' },
  { label: 'اللاذقية', value: 'اللاذقية' },
  { label: 'طرطوس', value: 'طرطوس' },
];

const edit = () => {
  const navigation = useNavigation();
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);

  const fullNameRef = useRef(null);
  const phoneRef = useRef(null);
  const locationRef = useRef(null);
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    fullName: false,
    phone: false,
    location: false,
    username: false,
    password: false,
    confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return;
        const response = await axios.get(`${API_BASE_URL}/profile/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = response.data;
        setFormData(prev => ({
          ...prev,
          fullName: data.name || '',
          phone: data.phone || '',
          location: data.city || '',
          username: data.username || '',
          email: data.email || '',
        }));
      } catch (error) {
        console.error("Error fetching profile data", error);
      }
    };

    fetchProfile();
  }, []);

  const validateFirstSection = () => {
    const newErrors = {
      fullName: !formData.fullName.trim(),
      phone: !formData.phone.trim(),
      location: !formData.location.trim(),
      username: !formData.username.trim(),
      password: formData.password ? !formData.password.trim() : false,
      confirmPassword: formData.password
        ? (!formData.confirmPassword.trim() || formData.confirmPassword !== formData.password)
        : false,
    };

    setErrors(prev => ({ ...prev, ...newErrors }));
    return !Object.values(newErrors).some(Boolean);
  };

  const validateSecondSection = () => {
    const newErrors = {};
    setErrors(prev => ({ ...prev, ...newErrors }));
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validateFirstSection() || !validateSecondSection()) {
      setErrorMessage('يرجى ملء جميع الحقول الإلزامية بشكل صحيح');
      setErrorVisible(true);
      return;
    }

    try {
      const userData = {
        username: formData.username,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        phone: formData.phone,
        city: formData.location,
        email: formData.email,
        name: formData.fullName,
      };

      await updateProfileInfo(userData);
      navigation.navigate('confedit');
    } catch (error) {
      let errorMessage = 'حدث خطأ غير متوقع أثناء تعديل الحساب';
      if (error.username) {
        errorMessage = `اسم المستخدم: ${error.username.join(', ')}`;
      } else if (error.phone) {
        errorMessage = `رقم الهاتف: ${error.phone.join(', ')}`;
      } else if (error.password) {
        errorMessage = `كلمة المرور: ${error.password.join(', ')}`;
      } else if (error.confirm_password) {
        errorMessage = `تأكيد كلمة المرور: ${error.confirm_password.join(', ')}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setErrorMessage(errorMessage);
      setErrorVisible(true);
    }
  };

  const shouldShowError = (fieldName) => {
    return errors[fieldName] && fieldName !== 'email';
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContainer, { paddingBottom: 100 }]}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
    >
      <ErrorMessageModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />

      <View style={styles.header}>
        <Text style={styles.title}>تعديل المعلومات الشخصية</Text>
      </View>

      <Text style={styles.label}>المحافظة</Text>
        <View style={[styles.pickerContainer, shouldShowError('location') && styles.error]}>
          <Picker
            selectedValue={formData.location}
            style={styles.picker}
            itemStyle={styles.PickerItem}
            mode="dropdown"
            dropdownIconColor="#4D4FFF"
            onValueChange={(itemValue) => {
              setFormData(prev => ({ ...prev, location: itemValue }));
              setErrors(prev => ({ ...prev, location: false }));
            }}
          >
            <Picker.Item label="اختر المحافظة" value="" />
            {GOVERNORATES_OPTIONS.map((item, index) => (
              <Picker.Item key={index} label={item.label} value={item.value} />
            ))}
          </Picker>
        </View>
        
      <View style={styles.inputGroup}>
        <Text style={styles.label}>الاسم الكامل</Text>
        <TextInput
          ref={fullNameRef}
          style={[styles.input, shouldShowError('fullName') && styles.error]}
          value={formData.fullName}
          onChangeText={text => {
            setFormData(prev => ({ ...prev, fullName: text }));
            setErrors(prev => ({ ...prev, fullName: false }));
          }}
          returnKeyType="next"
          onSubmitEditing={() => phoneRef.current.focus()}
        />

        <Text style={styles.label}>رقم الموبايل</Text>
        <TextInput
          ref={phoneRef}
          style={[styles.input, shouldShowError('phone') && styles.error]}
          value={formData.phone}
          onChangeText={text => {
            setFormData(prev => ({ ...prev, phone: text }));
            setErrors(prev => ({ ...prev, phone: false }));
          }}
          keyboardType="phone-pad"
          returnKeyType="next"
          autoCapitalize="none"
          onSubmitEditing={() => usernameRef.current.focus()} // تغيير هنا
        />

        

       <Text style={styles.label1}>
  اسم المستخدم
  <Text style={styles.optionalText}> (تحتاجه عند تسجيل الدخول)</Text>
</Text>
<TextInput
  ref={usernameRef}
  style={[styles.input, shouldShowError('username') && styles.error]}
  value={formData.username}
  onChangeText={text => {
    setFormData(prev => ({ ...prev, username: text }));
    setErrors(prev => ({ ...prev, username: false }));
  }}
  returnKeyType="next"
  autoCapitalize="none"
  onSubmitEditing={() => passwordRef.current.focus()} // تعديل هنا
/>

<Text style={styles.label}>كلمة المرور</Text>
<View style={styles.passwordContainer}>
  <TextInput
    ref={passwordRef}
    style={[styles.passwordInput, shouldShowError('password') && styles.error]}
    value={formData.password}
    onChangeText={text => {
      setFormData(prev => ({ ...prev, password: text }));
      setErrors(prev => ({ ...prev, password: false }));
    }}
    secureTextEntry={!showPassword}
    returnKeyType="next"
    autoCapitalize="none"
    onSubmitEditing={() => confirmPasswordRef.current.focus()} // يبقى كما هو
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

        <Text style={styles.label}>تأكيد كلمة المرور</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            ref={confirmPasswordRef}
            style={[styles.passwordInput, shouldShowError('confirmPassword') && styles.error]}
            value={formData.confirmPassword}
            onChangeText={text => {
              setFormData(prev => ({ ...prev, confirmPassword: text }));
              setErrors(prev => ({ ...prev, confirmPassword: false }));
            }}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Image
              source={showConfirmPassword ? eyeOpen : eyeClosed}
              style={styles.eyeIconImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
          <Text style={styles.nextText}>تأكيد</Text>
          <Image source={next} style={styles.nextimg} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Image source={cancel} style={styles.cancelimg} />
          <Text style={styles.cancelText}>الغاء</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 50 }} />
    </KeyboardAwareScrollView>
  );
};

// بقية الأنماط تبقى كما هي بدون تغيير...

async function updateProfileInfo(userData) {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const response = await axios.post(`${API_BASE_URL}/update_user_info/`, userData, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else if (error.request) {
      throw { message: 'لا يوجد اتصال بالخادم' };
    } else {
      throw { message: error.message };
    }
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContainer: {
    padding: 30,
  },
  header: {
    marginBottom: 10,
    marginTop: 10
  },
  title: {
    fontSize: 25,
    textAlign: 'center',
    color: '#4d4fff',
    fontFamily: 'NotoKufiArabic-Bold',
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 10,
    color: '#000',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  label1: {
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 10,
    paddingTop: 10,
    color: '#000',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  optionalText: {
    color: '#808080',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#fff',
    fontSize: 15,
    height: 50,
    padding: 5,
    textAlign: 'right',
    justifyContent: 'center',
    marginBottom: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
    fontFamily: 'NotoKufiArabic-Regular',
    textAlign: 'right',
  },
  picker: {
    height: 'auto',
    width: '100%',
    textAlign: 'right',
    paddingRight: 10,
    backgroundColor: '#fff',
      textAlign: 'right', // لمحاذاة النص إلى اليمين
    direction: 'rtl',
  },
  PickerItem: {
    fontFamily: 'NotoKufiArabic-Regular',
    fontSize: 15,
    color: '#000'
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    height: 'auto',
    padding: 5,
    textAlign: 'right',
    fontFamily: 'NotoKufiArabic-Regular',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff'
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
  error: {
    borderColor: 'red',
    borderWidth: 1,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  nextButton: {
    flexDirection: 'row-reverse',
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
  },
  nextText: {
    fontSize: 20,
    color: '#FFF',
    marginHorizontal: 10,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  nextimg: {
    width: 40,
    height: 40,
    tintColor: '#fff'
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  cancelText: {
    fontSize: 20,
    color: '#000',
    marginHorizontal: 20,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  cancelimg: {
    width: 25,
    height: 25,
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
});



export default edit;
