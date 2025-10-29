import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import { useNavigation } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import search from '@/assets/images/search.png';
import close from '@/assets/images/close.png';
import arrow from '@/assets/images/arrow.png'; 


const SearchPage = () => {
  const [id, setid] = useState('');
  const [region, setRegion] = useState('');
  const [type, setType] = useState('');
  const [details, setDetails] = useState('');
  const [max, setMax] = useState('');
  const [min, setMin] = useState('');

  const navigation = useNavigation();

  // دالة للتحقق من تعبئة حقل واحد على الأقل
  const isAnyFieldFilled = () => {
    return (
      id.trim() !== '' ||
      region.trim() !== '' ||
      type.trim() !== '' ||
      details.trim() !== '' ||
      max.trim() !== '' ||
      min.trim() !== ''
    );
  };

  // دالة تنفيذ البحث مع إرسال إشعار في حالة عدم تعبئة حقل واحد على الأقل
  const handleSearch = () => {
    // if (!isAnyFieldFilled()) {
    //   Alert.alert('تنبيه', 'يرجى ملئ حقل واحد على الاقل لإجراء البحث');
    // } else {
    navigation.navigate('gallary', {
      property_id: details,   // Property ID (“تحديد رقم العقار”)
      province: region,       // المحافظة (will map to the "city" filter)
      type: type,             // نوع العقار
      area: id,               // المنطقة (will map to the "region" filter in Django, which uses town)
      minPrice: min,          // الحد الأدنى للسعر
      maxPrice: max,          // الحد الأعلى للسعر
    });
    // }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
    >
       <StatusBar
        style="light" // اختر "light" أو "dark" حسب خلفية التطبيق
        hidden={false} // قم بعرض أو إخفاء البار العلوي
        translucent={true} // جعل البار شفافًا إذا أردت
        backgroundColor="#4D4FFF" // لون الخلفية إذا كان غير شفاف
      />
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('gallary')}>
          <Image source={arrow} style={styles.arrowIcon} />
        </TouchableOpacity>
        <Text style={styles.title1}>بحث متقدم </Text>
      </View>

      <View style={styles.section0}>
        <Text style={styles.headtitle}>تحديد رقم العقار</Text>
        <View style={styles.filter1}>
          <Text style={styles.title}>id</Text>
          <TextInput
            style={styles.placeinput}
            value={details}
            onChangeText={setDetails}
            returnKeyType="done"
            blurOnSubmit={true}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.headtitle}>تحديد المكان</Text>
        <View style={styles.filter1}>
          <Text style={styles.title}>المحافظة</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={region}
              style={styles.picker}
              itemStyle={styles.PickerItem}
              mode="dropdown"
              dropdownIconColor="#4D4FFF"
              onValueChange={(itemValue) => setRegion(itemValue)}
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
        </View>

        <View style={styles.filter1}>
          <Text style={styles.title}>نوع العقار</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={type}
              style={styles.picker}
              itemStyle={styles.PickerItem}
              mode="dropdown"
              dropdownIconColor="#4D4FFF"
              onValueChange={(itemValue) => setType(itemValue)}
            >
              <Picker.Item label="حدد نوع العقار ..." value="" />
              <Picker.Item label="فيلّا" value="فيلّا" />
              <Picker.Item label="مزرعة" value="مزرعة" />
              <Picker.Item label="شقة" value="شقة" />
            </Picker>
          </View>
        </View>

        <View style={styles.filter1}>
          <Text style={styles.title}>المنطقة</Text>
          <TextInput
            style={styles.placeinput}
            value={id}
            onChangeText={setid}
          />
        </View>
      </View>

      <View style={styles.section2}>
        <Text style={styles.headtitle}>تحديد حدود السعر</Text>
        <View style={styles.cost}>
          <View style={styles.filter2}>
            <Text style={styles.title}>من:</Text>
            <View style={styles.dolarncost}>
              <TextInput
                style={styles.costinput}
                value={min}
                onChangeText={setMin}
                keyboardType="numeric"
              />
              <Text style={styles.dolar}> $</Text>
            </View>
          </View>

          <View style={styles.filter2}>
            <Text style={styles.title}>الى:</Text>
            <View style={styles.dolarncost}>
              <TextInput
                style={styles.costinput}
                value={max}
                onChangeText={setMax}
                keyboardType="numeric"
              />
              <Text style={styles.dolar}> $</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.line}></View>

      <View style={styles.btns}>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch} // يتم تنفيذ handleSearch عند الضغط على الزر
        >
          <Text style={styles.searchText}>بحث</Text>
          <Image source={search} style={styles.searchimg} />
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    backgroundColor: '#fff',
    
        backgroundColor: '#F7F7F7',

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
    backgroundColor:'#4D4FFF',

  },
  title1: {
    fontSize: 25,
    textAlign: 'right',
    marginTop: -8,
    fontFamily: 'NotoKufiArabic-Bold',

  },
  arrowIcon: {
    width: 40,
    height: 40,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  head: {
    flex: 0.2,
    marginTop: 10,
  },
  section0: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    paddingRight: 20,
    paddingLeft: 20,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 5,
    shadowRadius: 10,
    borderRadius: 20,
    borderBottomColor: 'rgba(149, 147, 147, 0.69)',

    borderBottomWidth: 2,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    paddingRight: 20,
    paddingLeft: 20,
    paddingTop: 10,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 5,
    shadowRadius: 10,
    borderRadius: 20,
    borderBottomColor: 'rgba(149, 147, 147, 0.69)',

    borderBottomWidth: 2,
  },
  section2: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    paddingRight: 20,
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 10,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 5,
    shadowRadius: 10,
    borderRadius: 20,
    borderBottomColor: 'rgba(149, 147, 147, 0.69)',

    borderBottomWidth: 2,
  },
  filter1: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  headtitle: {
    color: 'rgba(35, 34, 34, 0.78)',
    fontSize: 20,
    textAlign: 'right',
    fontFamily: 'NotoKufiArabic-Bold',
    marginTop:-10,
  },
  title: {
    fontSize: 18,
    textAlign: 'right',
    paddingRight: 5,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  pickerContainer: {
    height: 'auto',
    borderColor: Platform.OS === 'android' ? '#ccc' : 0,
    borderWidth: Platform.OS === 'android' ? 1 : 0,
    borderRadius: 8,
    overflow: 'hidden',
    fontFamily: 'NotoKufiArabic-Regular',
    textAlign: 'right'
  },
  picker: {
    height: 'auto',
    textAlign: 'right',
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor:'#fff',
 textAlign: 'right', // لمحاذاة النص إلى اليمين
    direction: 'rtl',
  },
  PickerItem: {
    fontFamily: 'NotoKufiArabic-Regular',
    fontSize: 15,
    color: '#000',

  },
  placeinput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor:'#fff',
    textAlign: 'right',
  },
  cost: {
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  filter2: {},
  dolarncost: {
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  dolar: {
    fontSize: 20,
    textAlign: 'right',
    fontFamily: 'NotoKufiArabic-Bold',
  },
  costinput: {
    height: 'auto',
    padding: 10,
    textAlign: 'right',
    width: 90,
    backgroundColor:'#fff',

  },
  line: {
    height: 2,
    width: '100%',
    shadowColor: 'rgba(0, 0, 0, 1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 5,
    shadowRadius: 10,
  },
  btns: {
    height: 130,
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'NotoKufiArabic-Regular',
    marginRight:20,
    marginLeft:20,
  },
  searchButton: {
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
  searchText: {
    fontSize: 20,
    color: '#FFF',
    marginHorizontal: 10,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  searchimg: {
    tintColor:'#fff',
    marginRight: 10,
    width: 25,
    height: 25,
    resizeMode: 'contain',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  // تأكد من إضافة أنماط الصور الخاصة بـ close و search إذا كانت متاحة.
});

export default SearchPage;
