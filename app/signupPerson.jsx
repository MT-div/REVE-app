import React, { useRef, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from './config'; // Ensure your API_BASE_URL is correctly set
import back from '@/assets/images/back2.jpg';
import next from '@/assets/images/next.png';
import goback from '@/assets/images/goback.png';
import cancel from '@/assets/images/cancel.png';
import { Picker } from '@react-native-picker/picker';

// Define cities options for the المحافظة picker
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

  // Input references
  const fullNameRef = useRef(null);
  const phoneRef = useRef(null);
  // For the location field we will use a Picker so no "ref" is needed.
  const emailRef = useRef(null);

  // State for inputs and error management
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  // Set initial value for location as the placeholder text
  const [location, setLocation] = useState('ادخل موقعك');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({
    fullName: false,
    phone: false,
    location: false,
    email: false,
  });
  const [loading, setLoading] = useState(false);

  // Called when the user taps "تأكيد"
  const handleConfirmPress = async () => {
    // Validate inputs – note that email is optional.
    const newErrors = {
      fullName: !fullName.trim(),
      phone: !phone.trim(),
      location: false, // we'll validate location separately
      email: false,
    };

    // Validate full name
    if (newErrors.fullName) {
      Alert.alert('خطأ', 'يرجى ملء حقل الاسم الكامل');
      setErrors((prev) => ({ ...prev, fullName: true }));
      return;
    }

    // Validate phone – must not be empty, must start with "0" and be exactly 10 digits.
    if (!phone.trim()) {
      Alert.alert('خطأ', 'يرجى ملء حقل رقم الموبايل');
      setErrors((prev) => ({ ...prev, phone: true }));
      return;
    } else if (phone.length !== 10 || phone[0] !== '0') {
      Alert.alert('خطأ', 'ادخل رقم سوري');
      setErrors((prev) => ({ ...prev, phone: true }));
      return;
    }

    // Validate location – ensure the user has changed the default placeholder.
    if (location === 'ادخل موقعك') {
      Alert.alert('خطأ', 'يرجى اختيار المحافظة');
      setErrors((prev) => ({ ...prev, location: true }));
      return;
    }

    setErrors(newErrors);

    // Prepare the data object to match what the Django view expects
    const personData = {
      name: fullName,        // "الاسم الكامل" maps to your Django "name" field
      phone: phone,          // رقم الموبايل
      city: location,        // المحافظة (sent as "city")
      email: email,          // الايميل (optional)
    };

    try {
      setLoading(true);
      // Make a POST request to your Django PersonSignUpView endpoint.
      // Adjust the URL path according to your Django URL configuration.
      const response = await axios.post(`${API_BASE_URL}/signup2/`, personData);

      if (response.status === 201) {
        Alert.alert('نجاح', 'تم تسجيل البيانات بنجاح!');
        // Navigate to the signup credentials page (signupUser), passing person_id from the response.
        navigation.navigate('signupUser', { person_id: response.data.person_id });
      } else {
        console.error('Unexpected response:', response);
        Alert.alert('خطأ', 'حدث خطأ غير متوقع، الرجاء المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('Error during PersonSignUp:', error.response?.data || error.message);
      Alert.alert(
        'خطأ',
        error.response?.data?.error || 'حدث خطأ أثناء محاولة التسجيل. يرجى المحاولة مرة أخرى.'
      );
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
      <View style={styles.mainContainer}>
        <View style={styles.background}>
          <Image source={back} style={styles.topimage} />
          <View style={styles.overlay} />
        </View>
        <View style={styles.container}>
          <View style={styles.newcont}>
            <Text style={styles.new}>انشاء حساب جديد</Text>
          </View>
          <View style={styles.input}>
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
              returnKeyType="next"
              onChangeText={(text) => {
                setPhone(text);
                if (text.trim()) setErrors((prev) => ({ ...prev, phone: false }));
              }}
              onSubmitEditing={() => {}}
              ref={phoneRef}
            />
            <Text style={styles.inputText}>المحافظة</Text>
            {/* Use a Picker for selecting the city */}
            <View style={[styles.textplacpicker, errors.location && styles.errorBorder]}>
              <Picker
                selectedValue={location}
                
                onValueChange={(itemValue) => {
                  setLocation(itemValue);
                  if (itemValue !== 'ادخل موقعك') {
                    setErrors((prev) => ({ ...prev, location: false }));
                  }
                }}
                style={[styles.picker,{ color: location === 'ادخل موقعك' ? '#999' : '#000' }]}
              >
                {cities.map((city) => (
                  <Picker.Item key={city.value} label={city.label} value={city.value} />
                ))}
              </Picker>
            </View>
           
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
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: '1000',
        fontSize: 25,
        color: '#000000',
        textAlign: 'right',

    },
    
    chosentext: {
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: '200',
        fontSize: 20,
        color: '#000000',
        textAlign: 'right',
        marginRight: -10,
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
        marginTop: -10,

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
        marginTop: -10,

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
    // تعديل خصائص الظلال:
    nextButton: {
        display: 'flex',
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingRight: 10,
        marginRight: -31,
        width: 139,
        height: 71,
        backgroundColor: '#fff',
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
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: 800,
        fontSize: 25,
        color: '#4D4FFF',
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
        backgroundColor: '#fff',



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
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: '800',
        fontSize: 25,
        color: '#4D4FFF',
    },
    cancelimg: {
        width: 25,
        height: 25,
        tintColor:'#4D4FFF',
    },
    nextimg: {
      tintColor:'#4D4FFF',
        width: 50,
        height: 50,
    },

});

export default SignupPersonPage;
