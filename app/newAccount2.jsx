import React, { useRef, useState } from 'react';
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'; // Only one import
import axios from 'axios';
import { useAuth } from '../src/context/AuthContext';
import back from '@/assets/images/back2.jpg';
import next from '@/assets/images/next.png';
import goback from '@/assets/images/goback.png';
import { API_BASE_URL } from './config';
import { Picker } from '@react-native-picker/picker';
const NewAccount2 = ({ route }) => {
    // ... بقية الكود بدون تغيير
    
    const navigation = useNavigation();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);

    // الحقول
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({
        name: false,
        phone: false,
        city: false
    });
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

    const validateInputs = () => {
        const newErrors = {
            name: !name.trim(),
            phone: !/^\d{10}$/.test(phone),
            city: !city.trim()
        };
        console.log('asbfhdiajnoklaed'),

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };



    const handleCompleteProfile = async () => {
        // Validate phone number before proceeding
        if (phone.length !== 10 || phone[0] !== '0') {
            Alert.alert('خطأ', 'الرجاء إدخال رقم هاتف سوري صحيح (يبدأ بـ 0 ويتكون من 10 أرقام)');
            return;
        }
        
        if (!validateInputs()) {
            Alert.alert('خطأ', 'يرجى تصحيح الحقول المميزة');
            return;
        }
    
        setLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/signup2/`,
                {
                    name,
                    phone,
                    city,
                    email
                },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            const personId = response.data.person_id; // Extract returned person_id
            
            // Save person_id temporarily if needed
            await AsyncStorage.setItem('personId', personId.toString());
    
            // Navigate to newAccount and pass personId
            navigation.navigate('newAccount', { personId });
    
        } catch (error) {
            const message = error.response?.data?.error || 'فشل في إكمال التسجيل';
            Alert.alert('خطأ', message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        
        <KeyboardAwareScrollView
            style={styles.thecontainer}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
        >
            <View style={styles.mainContainer}>
                <View style={styles.background}>
                    <Image source={back} style={styles.topimage} />
                    <View style={styles.overlay} />
                </View>

                <View style={styles.container}>
                    <View style={styles.newcont}>
                        <Text style={styles.new}>إكمال الملف الشخصي</Text>
                    </View>

                    <View style={styles.input}>
                        <Text style={styles.inputText}>الاسم الكامل</Text>
                        <TextInput
                            style={[styles.textplace, errors.name && styles.errorBorder]}
                            value={name}
                            onChangeText={setName}
                            returnKeyType="next"
                        />

                        <Text style={styles.inputText}>رقم الهاتف</Text>
                        <TextInput
                            style={[styles.textplace, errors.phone && styles.errorBorder]}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            maxLength={10}
                            returnKeyType="next"
                        />

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputText}>المحافظة</Text>
                            <View style={[styles.pickerWrapper, errors.city && styles.errorBorder]}>
                                <Picker
                                    selectedValue={city}
                                    onValueChange={(itemValue) => setCity(itemValue)}
                                    style={styles.picker}
                                    itemStyle={styles.PickerItem}
                                    mode="dropdown"
                                    dropdownIconColor="#4D4FFF"
                                >
                                    {cities.map((item, index) => (
                                        <Picker.Item key={index} label={item.label} value={item.value} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <Text style={styles.inputText}>البريد الإلكتروني (اختياري)</Text>
                        <TextInput
                            style={styles.textplace}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            returnKeyType="done"
                        />
                    </View>

                    <View style={styles.gocont}>
                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={handleCompleteProfile}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text style={styles.nextText}>إنهاء</Text>
                                    <Image source={next} style={styles.nextimg} />
                                </>
                            )}
                        </TouchableOpacity>

                        
                    </View>
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        marginVertical: 10,
    },
    inputText: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    // Wrapper for the Picker so that you can apply a border and padding similar to a TextInput
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        overflow: 'hidden',
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
    errorBorder: {
        borderColor: 'red',
    },
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
        fontFamily: 'NotoKufiArabic-Regular',
    },
    overlay: {
        position: 'absolute',
        height: '130%',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        fontFamily: 'NotoKufiArabic-Regular',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        padding: 30,
        flexGrow: 1,
        borderTopLeftRadius: 70,
        borderTopRightRadius: 70,
        fontFamily: 'NotoKufiArabic-Regular',
    },
    newcont: {
        flex: 0.7,
        marginBottom: 20,
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
        fontFamily: 'NotoKufiArabic-Regular',
    },
    new: {

        fontSize: 25,
        color: '#000',
        textAlign: 'center',
        fontFamily: 'NotoKufiArabic-Bold',
    },
    input: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        flex: 3.5,
        fontFamily: 'NotoKufiArabic-Regular',
    },
    inputText: {
        fontSize: 20,
        color: '#000000',
        textAlign: 'right',
        fontFamily: 'NotoKufiArabic-Regular',
    },
    chosentext: {
        fontSize: 20,
        color: '#000000',
        textAlign: 'right',
        marginRight: -10,
        fontFamily: 'NotoKufiArabic-Regular',
    },
    textplace: {
        backgroundColor: '#D9D9D9',
        fontSize: 15,
        height: 'auto',
        paddingHorizontal: 10,
        textAlign: 'right',
        marginBottom: 15,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'transparent',
        fontFamily: 'NotoKufiArabic-Regular',
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
        fontFamily: 'NotoKufiArabic-Regular',
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
        backgroundColor: '#4D4FFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 15,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        fontFamily: 'NotoKufiArabic-Regular',
    },
    nextText: {
        fontSize: 23,
        color: '#000000',
        fontFamily: 'NotoKufiArabic-Regular',
        marginTop: -10,
    },
    nextimg: {
        width: 45,
        height: 45,
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 15,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
    },
    cancelText: {
        fontSize: 23,
        color: '#000000',
        fontFamily: 'NotoKufiArabic-Regular',
        marginTop: -10,
    },
    
    cancelimg: {
        width: 45,
        height: 45,
    },
});

export default NewAccount2;
