import React, { useRef, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import next from '@/assets/images/next.png';
import cancel from '@/assets/images/cancel.png';
import eyeOpen from '@/assets/images/eye-open.png';
import eyeClosed from '@/assets/images/eye-closed.png';
import { API_BASE_URL } from './config';

const signUp = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signup/`, userData);
    console.log(API_BASE_URL);

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
};

const SYRIAN_GOVERNORATES = [
  'دمشق',
  'ريف دمشق',
  'حلب',
  'حمص',
  'حماه',
  'اللاذقية',
  'طرطوس',
  'إدلب',
  'درعا',
  'السويداء',
  'القنيطرة',
  'دير الزور',
  'الحسكة',
  'الرقة',
  'حماة',
];

const SignupScreen = () => {
  const navigation = useNavigation();

  // Refs for all inputs
  const fullNameRef = useRef(null);
  const phoneRef = useRef(null);
  const locationRef = useRef(null);
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    fullName: false,
    phone: false,
    location: false,
    username: false,
    password: false,
    confirmPassword: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateFirstSection = () => {
    const newErrors = {
      fullName: !formData.fullName.trim(),
      phone: !formData.phone.trim(),
      location: !formData.location.trim(),
      username: !formData.username.trim(),
      password: !formData.password.trim(),
      confirmPassword: !formData.confirmPassword.trim() || 
                      formData.confirmPassword !== formData.password
    };
    
    setErrors(prev => ({...prev, ...newErrors}));
    return !Object.values(newErrors).some(Boolean);
  };

  const validateSecondSection = () => {
    const newErrors = {};
    setErrors(prev => ({...prev, ...newErrors}));
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validateFirstSection() || !validateSecondSection()) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول الإلزامية بشكل صحيح');
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
        name: formData.fullName
      };
      console.log(userData);
      console.log(1)

      const response = await signUp(userData);
      console.log(2)

      navigation.navigate('welcome', { 
        userId: response.user_id,
        personId: response.person_id
      });
      console.log(3) 

    } catch (error) {
      let errorMessage = 'حدث خطأ غير متوقع أثناء التسجيل';
      
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
      
      Alert.alert('فشل التسجيل', errorMessage);
    }
  };

  const shouldShowError = (fieldName) => {
    return errors[fieldName] && fieldName !== 'email';
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContainer, {paddingBottom: 100}]}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>انشاء حساب جديد</Text>
      </View>

      {/* Personal Info Section */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>الاسم الكامل</Text>
        <TextInput
          ref={fullNameRef}
          style={[styles.input, shouldShowError('fullName') && styles.error]}
          value={formData.fullName}
          onChangeText={text => {
            setFormData(prev => ({...prev, fullName: text}));
            setErrors(prev => ({...prev, fullName: false}));
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
            setFormData(prev => ({...prev, phone: text}));
            setErrors(prev => ({...prev, phone: false}));
          }}
          keyboardType="phone-pad"
          returnKeyType="next"
          onSubmitEditing={() => locationRef.current.focus()}
        />

<Text style={styles.label}>المحافظة</Text>
<View style={[styles.pickerContainer, shouldShowError('location') && styles.error]}>
  <Picker
    selectedValue={formData.location}
    onValueChange={(itemValue) => {
      setFormData(prev => ({...prev, location: itemValue}));
      setErrors(prev => ({...prev, location: false}));
    }}
    mode="dropdown"
    style={styles.picker}
  >
    <Picker.Item label="اختر المحافظة" value="" />
    {SYRIAN_GOVERNORATES.map((gov, index) => (
      <Picker.Item key={index} label={gov} value={gov} />
    ))}
  </Picker>
</View>

        {/* Account Info Section */}
        <Text style={styles.label1}>
          اسم المستخدم
          <Text style={styles.optionalText}> (تحتاجه عند تسجيل الدخول)</Text>
        </Text>
        <TextInput
          ref={usernameRef}
          style={[styles.input, shouldShowError('username') && styles.error]}
          value={formData.username}
          onChangeText={text => {
            setFormData(prev => ({...prev, username: text}));
            setErrors(prev => ({...prev, username: false}));
          }}
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current.focus()}
        />

        <Text style={styles.label}>
          الايميل
          <Text style={styles.optionalText}> (اختياري)</Text>
        </Text>
        <TextInput
          ref={emailRef}
          style={styles.input}
          value={formData.email}
          onChangeText={text => setFormData(prev => ({...prev, email: text}))}
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current.focus()}
        />

        <Text style={styles.label}>كلمة المرور</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            ref={passwordRef}
            style={[styles.passwordInput, shouldShowError('password') && styles.error]}
            value={formData.password}
            onChangeText={text => {
              setFormData(prev => ({...prev, password: text}));
              setErrors(prev => ({...prev, password: false}));
            }}
            secureTextEntry={!showPassword}
            returnKeyType="next"
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
              setFormData(prev => ({...prev, confirmPassword: text}));
              setErrors(prev => ({...prev, confirmPassword: false}));
            }}
            secureTextEntry={!showConfirmPassword}
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

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={handleSubmit}
        >
          <Text style={styles.nextText}>تأكيد</Text>
          <Image source={next} style={styles.nextimg} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
        >
          <Image source={cancel} style={styles.cancelimg} />
          <Text style={styles.cancelText}>الغاء</Text>
        </TouchableOpacity>
      </View>

      {/* مساحة إضافية تحت الأزرار */}
      <View style={{height: 50}} />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 30,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 25,
    textAlign: 'center',
    color: '#000',
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
    paddingTop:10,
    color: '#000',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  optionalText: {
    color: '#808080',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#D9D9D9',
    fontSize: 15,
    height: 'auto',
    padding: 5,
    textAlign: 'right',
    justifyContent: 'center',
    marginBottom: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'transparent',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  picker: {
    height: 'auto',
    width: '100%',
    textAlign: 'right',
    paddingRight: 10,
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

  },
  eyeIcon: {
    padding: 10,
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
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  nextButton: {
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingRight: 10,
    marginRight: -31,
    width: 139,
    height: 71,
    backgroundColor: '#4D4FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 15,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  nextText: {
    fontSize: 20,
    color: '#000000',
    fontFamily: 'NotoKufiArabic-Regular',

  },
  nextimg: {
    width: 40,
    height: 40,
  },
  cancelButton: {
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: -31,
    width: 139,
    height: 71,
    backgroundColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 15,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  cancelText: {
    fontFamily: 'NotoKufiArabic-Regular',
    fontSize: 20,
    color: '#000000',
  },
  cancelimg: {
    width: 25,
    height: 25,
  },
});

export default SignupScreen;