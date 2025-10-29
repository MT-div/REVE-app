
import back from '@/assets/images/back2.jpg';
import cancel from '@/assets/images/cancel.png';
import next from '@/assets/images/next.png';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
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

const cities = [
  { label: 'ادخل موقعك', value: 'ادخل موقعك' },
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

const SignupPersonPage = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('ادخل موقعك');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({
    fullName: false,
    phone: false,
    location: false,
    email: false,
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);

  // Refs for input fields
  const fullNameRef = useRef(null);
  const phoneRef = useRef(null);
const handleConfirmPress = async () => {
  const newErrors = {
    fullName: !fullName.trim(),
    phone: !phone.trim(),
    location: false,
    email: false,
  };

  if (newErrors.fullName) {
    setErrorMessage('يرجى ملء حقل الاسم الكامل');
    setErrorVisible(true);
    setErrors((prev) => ({ ...prev, fullName: true }));
    return;
  }

  if (!phone.trim()) {
    setErrorMessage('يرجى ملء حقل رقم الموبايل');
    setErrorVisible(true);
    setErrors((prev) => ({ ...prev, phone: true }));
    return;
  }

  // معالجة رقم الهاتف
  let processedPhone = phone.trim();
  
  // إزالة +963 أو 00963 واستبدالها بـ 0
  if (processedPhone.startsWith('+963')) {
    processedPhone = '0' + processedPhone.slice(4);
  } else if (processedPhone.startsWith('00963')) {
    processedPhone = '0' + processedPhone.slice(5);
  }

  // التحقق من صحة الرقم بعد المعالجة
  if (processedPhone.length !== 10 || processedPhone[0] !== '0') {
    setErrorMessage('ادخل رقم سوري\nاذا لم يكن رقمك سوري تواصل مع فريق الدعم على الارقام الموجودة في صفحة الاعدادات');
    setErrorVisible(true);
    setErrors((prev) => ({ ...prev, phone: true }));
    return;
  }

  if (location === 'ادخل موقعك') {
    setErrorMessage('يرجى اختيار المحافظة');
    setErrorVisible(true);
    setErrors((prev) => ({ ...prev, location: true }));
    return;
  }

  setErrors(newErrors);

  const personData = {
    name: fullName,
    phone: processedPhone, // استخدام الرقم المعالج هنا
    city: location,
    email: email,
  };

  try {
    setLoading(true);
    const response = await axios.post(`${API_BASE_URL}/signup2/`, personData);

    if (response.status === 201) {
      navigation.navigate('signupUser', { person_id: response.data.person_id });
    }
  } catch (error) {
    const errData = error.response?.data;
    const errorKey = errData ? Object.keys(errData)[0] : null;
    const errorMsg = errData && errorKey ? errData[errorKey] : 'حدث خطأ أثناء محاولة التسجيل. يرجى المحاولة مرة أخرى.';
    setErrorMessage(errorMsg);
    setErrorVisible(true);
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView
      style={styles.thecontainer}
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <ErrorMessageModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />

      <View style={styles.mainContainer}>
        <View style={styles.background}>
          <Image source={back} style={styles.topimage} />
          <View style={styles.overlay} />
        </View>
        <View style={styles.container}>
          <View style={styles.newcont}>
            <Text style={styles.new}>انشاء حساب جديد</Text>
          </View>
          <Text style={styles.impty}> </Text>
          
          <View style={styles.input}>
            <Text style={styles.inputText}>المحافظة</Text>
            <View style={[styles.textplacpicker, errors.location && styles.errorBorder]}>
              <Picker
                selectedValue={location}
                onValueChange={(itemValue) => {
                  setLocation(itemValue);
                  if (itemValue !== 'ادخل موقعك') {
                    setErrors((prev) => ({ ...prev, location: false }));
                  }
                }}
                style={[
      { color: location === 'ادخل موقعك' ? '#999' : '#000' },
      styles.pickerStyle // أضف هذا السطر
    ]}
              >
                {cities.map((city) => (
                  <Picker.Item key={city.value} label={city.label} value={city.value} />
                ))}
              </Picker>
            </View>
            <Text style={styles.inputText}>الاسم الكامل</Text>
            <TextInput
              style={[styles.textplace, errors.fullName && styles.errorBorder]}
              returnKeyType="next"

              onChangeText={(text) => {
                setFullName(text);
                if (text.trim()) setErrors((prev) => ({ ...prev, fullName: false }));
              }}
              onSubmitEditing={() => phoneRef.current.focus()}
              blurOnSubmit={false}
              ref={fullNameRef}
            />
            <Text style={styles.inputText}>رقم الموبايل</Text>
            <TextInput
              style={[styles.textplace, errors.phone && styles.errorBorder]}
              keyboardType="phone-pad"
              autoCapitalize="none"
              returnKeyType="next"
              onChangeText={(text) => {
                setPhone(text);
                if (text.trim()) setErrors((prev) => ({ ...prev, phone: false }));
              }}
              onSubmitEditing={handleConfirmPress}
              blurOnSubmit={false}
              ref={phoneRef}
            />
            
          </View>
          <View style={styles.gocont}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleConfirmPress}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.nextText}>التالي</Text>
                  <Image source={next} style={styles.nextimg} />
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.navigate('loginpage')}
            >
              <Image source={cancel} style={styles.cancelimg} />
              <Text style={styles.cancelText}>الغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  thecontainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  mainContainer: {
    flex: 1,
  },
  background: {
    width: '100%',
    height: '20%',
    maxHeight: 150,
    position: 'relative',
  },
  topimage: {
    width: '100%',
    height: '140%',
  },
  overlay: {
    position: 'absolute',
    height: '130%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F7F7F7',
    padding: 30,
    flexGrow: 1,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    borderColor:'#4D4FFF',
  },
  newcont: {
    flex: 1,
    marginBottom: 20,
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
  },
  new: {
    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: '900',
    fontSize: 40,
    color: '#4D4FFF',
    textAlign: 'center',
  },
  input: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    flex: 3,
  },
  inputText: {
    fontFamily: 'NotoKufiArabic-Regular',
    fontStyle: 'normal',
    fontWeight: '1000',
    fontSize: 22,
    color: '#000000',
    textAlign: 'right',
  },
  textplace: {
    backgroundColor: '#fff',
    fontSize: 20,
    height: 50,
    padding: 10,
    textAlign: 'right',
    marginBottom: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  textplacpicker: {
    backgroundColor: '#fff',
    fontSize: 20,
    height: 50,
    textAlign: 'right',
    marginBottom: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  errorBorder: {
    borderColor: 'red',
  },
  gocont: {
    flex: 1.5,
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 15,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderWidth:2,
    borderColor:'#4D4FFF',
  },
  nextText: {
    fontFamily: 'NotoKufiArabic-Regular',
    fontStyle: 'normal',
    fontWeight: 800,
    fontSize: 25,
    color: '#fff',
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
    backgroundColor: '#4D4FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 15,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth:2,
    borderColor:'#4D4FFF',
  },
  cancelText: {
    fontFamily: 'NotoKufiArabic-Regular',
    fontStyle: 'normal',
    fontWeight: '800',
    fontSize: 25,
    color: '#FFF',
  },
  cancelimg: {
    width: 25,
    height: 25,
    tintColor:'#FFF',
  },
  nextimg: {
    tintColor:'#FFF',
    width: 50,
    height: 50,
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
   pickerStyle: {
    textAlign: 'right', // لمحاذاة النص إلى اليمين
    direction: 'rtl', // لضمان اتجاه النص من اليمين لليسار للغات العربية
  },
});

export default SignupPersonPage;