
import Done from '@/assets/images/Done.png';
import arrow from '@/assets/images/arrow.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
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

const reg = () => {
  const navigation = useNavigation();
  const [region, setRegion] = useState('');
  const [type, setType] = useState('');
  const [details, setDetails] = useState('');
  const [moredetails, setMoreDetails] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const [regionError, setRegionError] = useState(false);
  const [typeError, setTypeError] = useState(false);
  const [detailsError, setDetailsError] = useState(false);
  const [moreDetailsError, setMoreDetailsError] = useState(false);

const handleSend = async () => {
  let isValid = true;

  if (!region) {
    setRegionError(true);
    isValid = false;
  } else {
    setRegionError(false);
  }

  if (!type) {
    setTypeError(true);
    isValid = false;
  } else {
    setTypeError(false);
  }

  if (!details.trim()) {
    setDetailsError(true);
    isValid = false;
  } else {
    setDetailsError(false);
  }

  if (!moredetails.trim()) {
    setMoreDetailsError(true);
    isValid = false;
  } else {
    setMoreDetailsError(false);
  }

  if (!isValid) {
    setErrorMessage("يرجى ملئ جميع الحقول");
    setErrorVisible(true);
    return;
  }

  try {
    const token = await AsyncStorage.getItem('authToken');

    if (!token) {
      setErrorMessage('يجب تسجيل الدخول أولاً');
      setErrorVisible(true);
      navigation.navigate('loginpage');
      return;
    }

    const requestData = {
      city: region,
      town: details,
      type: type,
      notes: moredetails,
    };

    const response = await fetch(`${API_BASE_URL}/new_realestate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.replace(/"/g, '')}`
      },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();

    if (response.status === 401) {
      setErrorMessage('انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى');
      setErrorVisible(true);
      await AsyncStorage.removeItem('authToken');
      navigation.navigate('login');
      return;
    }

    if (!response.ok) {
      // Extract the first error message provided by the backend,
      // for example: {"تنبيه!": "نرجو منك عدم كتابة كلمات غير محترمة"}
      const errorKey = Object.keys(data)[0];
      const errorMsg = data[errorKey] || 'فشل في إرسال البيانات';
      setErrorMessage(errorMsg);
      setErrorVisible(true);
      return;
    }
    
    navigation.navigate('confreg');

  } catch (error) {
    setErrorMessage('تعذر الاتصال بالخادم');
    setErrorVisible(true);
  }
};

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <ErrorMessageModal
          visible={errorVisible}
          message={errorMessage}
          onClose={() => setErrorVisible(false)}
        />

        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={arrow} style={styles.arrowIcon} />
          </TouchableOpacity>
          <Text style={styles.title}>اضافة عقار </Text>
        </View>

        <View style={styles.infocontainer}>
          <Text style={styles.welcomeMessage}>
            مرحبًا بك في صفحة تسجيل العقار الخاص بك.
          </Text>
          <Text style={styles.ex}>
            قم بادخال تفاصيل العقار الخاص بك, بالإضافة الى المنطقة بالتفصيل ومعلومات خاصة وميزات إضافية لعقارك تود عرضها.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={[styles.pickerContainer, regionError && styles.errorInput]}>
            <Picker
              selectedValue={region}
              style={styles.picker}
              itemStyle={styles.PickerItem}
              mode="dropdown"
              dropdownIconColor="#4D4FFF"
              onValueChange={(itemValue) => {
                setRegion(itemValue);
                if (itemValue !== '') setRegionError(false);
              }}
            >
              <Picker.Item label=" حدد المحافظة ..." value="" />
              <Picker.Item label="دمشق" value="دمشق" />
              <Picker.Item label="ريف دمشق" value="ريف دمشق" />
              <Picker.Item label="حمص" value="حمص" />
              <Picker.Item label="حماه" value="حماه" />
              <Picker.Item label="حلب" value="حلب" />
              <Picker.Item label="ادلب" value="ادلب" />
              <Picker.Item label="درعا" value="درعا" />
              <Picker.Item label="القنيطرة" value="القنيطرة" />
              <Picker.Item label="السويداء" value="السويداء" />
              <Picker.Item label="دير الزور" value="دير الزور" />
              <Picker.Item label="الرقة" value="الرقة" />
              <Picker.Item label="الحسكة" value="الحسكة" />
              <Picker.Item label="اللاذقية" value="اللاذقية" />
              <Picker.Item label="طرطوس" value="طرطوس" />
              <Picker.Item label="خارج سوريا" value="خارج سوريا" />
            </Picker>
          </View>

          <View style={[styles.pickerContainer, typeError && styles.errorInput]}>
            <Picker
              selectedValue={type}
              style={styles.picker}
              itemStyle={styles.PickerItem}
              mode="dropdown"
              dropdownIconColor="#4D4FFF"
              onValueChange={(itemValue) => {
                setType(itemValue);
                if (itemValue !== '') setTypeError(false);
              }}
            >
              <Picker.Item label=" حدد نوع العقار ..." value="" />
              <Picker.Item label="فيلّا" value="فيلّا" />
              <Picker.Item label="مزرعة" value="مزرعة" />
              <Picker.Item label="شقة" value="شقة" />
            </Picker>
          </View>

          <TextInput
            style={[styles.placeinput, detailsError && styles.errorInput]}
            multiline
            placeholder=" قم بكتابة منطقة العقار بالتفصيل هنا ..."
            value={details}
            onChangeText={(text) => {
              setDetails(text);
              if (text.trim() !== '') setDetailsError(false);
            }}
          />

          <TextInput
            style={[styles.infoinput, moreDetailsError && styles.errorInput]}
            multiline
            placeholder=" قم بكتابة معلومات خاصة بالعقار وميزات إضافية هنا ..."
            value={moredetails}
            onChangeText={(text) => {
              setMoreDetails(text);
              if (text.trim() !== '') setMoreDetailsError(false);
            }}
          />
        </View>

        <View style={styles.btns}>
          <TouchableOpacity style={styles.nextButton} onPress={handleSend}>
            <Text style={styles.nextText}>ارسال </Text>
            <Image source={Done} style={styles.nextimg} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
  
        // إزالة استخدام flex:1 هنا والاعتماد على محتوى ScrollView
      },
      headerContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: 'rgba(149, 147, 147, 0.69)',
        paddingBottom: 10,
        paddingTop:30,
        paddingRight:10,
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
      line: {
        height: 2,
        width: '100%',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        backgroundColor: 'rgba(149, 147, 147, 0.69)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 5,
        shadowRadius: 10,
        elevation: 15,
        fontFamily: 'NotoKufiArabic-Regular',
      },
      infocontainer: {
        marginBottom: 20,
        fontFamily: 'NotoKufiArabic-Regular',
        marginRight:20,
        marginLeft:20,
      },
      welcomeMessage: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'right',
        fontFamily: 'NotoKufiArabic-Regular',
      },
      ex: {
        fontSize: 22,
        textAlign: 'right',
        fontFamily: 'NotoKufiArabic-Regular',
      },
      section: {
        marginBottom: 20,
        fontFamily: 'NotoKufiArabic-Regular',
        marginRight:20,
        marginLeft:20,
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
        backgroundColor:'#fff',
     textAlign: 'right', // لمحاذاة النص إلى اليمين
    direction: 'rtl',
    
      },
      PickerItem: {
        fontFamily: 'NotoKufiArabic-Regular',
        fontSize: 15,
        color: '#000'
      },
      placeinput: {
        height: 'auto',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        textAlign: 'right',
        marginBottom: 10,
        fontFamily: 'NotoKufiArabic-Regular',
        backgroundColor:'#fff',
        
      },
      infoinput: {
        height: 'auto',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        textAlign: 'right',
        marginBottom: 10,
        fontFamily: 'NotoKufiArabic-Regular',
        backgroundColor:'#fff',
    
      },
      errorInput: {
        borderColor: 'red',
        borderWidth: 1,
        fontFamily: 'NotoKufiArabic-Regular',
      },
      btns: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'NotoKufiArabic-Regular',
        marginRight:20,
        marginLeft:20,
      },
      nextButton: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: '#4D4FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
        borderRadius: 10,
        borderWidth:2,
        borderColor:'#4D4FFF',
        
    
      },
      nextText: {
        fontSize: 20,
        color: '#FFF',
        marginHorizontal: 10,
        fontFamily: 'NotoKufiArabic-Regular',
      },
      nextimg: {
        marginRight: 10,
        width: 30,
        height: 30,
        resizeMode: 'contain',
        fontFamily: 'NotoKufiArabic-Regular',
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
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 5,
        shadowRadius: 10,
        elevation: 1,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
      },
      cancelText: {
        fontSize: 20,
        color: '#000000',
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

export default reg;