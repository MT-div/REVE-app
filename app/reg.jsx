import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Done from '@/assets/images/Done.png';
import cancel from '@/assets/images/cancel.png';
import arrow from '@/assets/images/arrow.png'; 

const HomePage = () => {
  const navigation = useNavigation();
  const [region, setRegion] = useState('');
  const [type, setType] = useState('');
  const [details, setDetails] = useState('');
  const [moredetails, setMoreDetails] = useState('');

  // Error state for each field
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
      Alert.alert("تنبيه", "يرجى ملئ جميع الحقول");
      return;
    }

    try {
      // Get user token from storage
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
        navigation.navigate('loginpage');
        return;
      }

      // Prepare request data (make sure the keys match your Django model)
      const requestData = {
        city: region,
        town: details,
        type: type,
        notes: moredetails,
      };

      // Send POST request to your Django endpoint
      const response = await fetch(`${API_BASE_URL}/new_realestate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.replace(/"/g, '')}`
        },
        body: JSON.stringify(requestData)
      });

      // Parse the JSON response from the server
      const data = await response.json();

      // Handle 401 explicitly for session expiration
      if (response.status === 401) {
        Alert.alert('خطأ', 'انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى');
        await AsyncStorage.removeItem('authToken');
        navigation.navigate('login');
        return;
      }

      // If the response is NOT ok (for instance, when the user already has a real estate entry)
      if (!response.ok) {
        // The error message from Django is sent via the "details" key
        Alert.alert('خطأ', data.details || 'فشل في إرسال البيانات');
        return;
      }

      // On success: show the success message and navigate accordingly
      
      navigation.navigate('confreg');

    } catch (error) {
      Alert.alert('خطأ', 'تعذر الاتصال بالخادم');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
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
          {/* Wrap Picker inside View to apply conditional styles */}
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
  },
  picker: {
    height: 'auto',
    width: '100%',
    textAlign: 'right',
    paddingRight: 10,
    backgroundColor:'#fff',


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
});

export default HomePage;
