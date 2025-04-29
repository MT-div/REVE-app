import React, { useRef, useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import back from '@/assets/images/back2.jpg';
import next from '@/assets/images/next.png';
import cancel from '@/assets/images/cancel.png';

const HomePage = () => {
    const navigation = useNavigation();

    // مراجع الإدخالات
    const fullNameRef = useRef(null);
    const phoneRef = useRef(null);
    const locationRef = useRef(null);

    // حالة لتتبع المدخلات وصحة الحقول
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [errors, setErrors] = useState({ fullName: false, phone: false, location: false });

    // التحقق من صحة الإدخالات
    const handleNextPress = () => {
        const newErrors = {
            fullName: !fullName.trim(),
            phone: !phone.trim(),
            location: !location.trim(),
        };

        setErrors(newErrors);

        // إذا لم تكن هناك أخطاء، الانتقال للشاشة التالية
        if (!newErrors.fullName && !newErrors.phone && !newErrors.location) {
            navigation.navigate('editAccount2');
        } else {
            Alert.alert('خطأ', 'يرجى ملء جميع الحقول الفارغة.');
        }
    };

    return (
        <KeyboardAwareScrollView
            style={styles.thecontainer}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.mainContainer}>
                <View style={styles.background}>
                    <Image source={back} style={styles.topimage} />
                </View>

                <View style={styles.container}>
                    <View style={styles.newcont}>
                        <Text style={styles.new}> تعديل الحساب</Text>
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
                            onSubmitEditing={() => locationRef.current.focus()}
                            blurOnSubmit={false}
                            ref={phoneRef}
                        />

                        <Text style={styles.inputText}>المحافظة</Text>
                        <TextInput
                            style={[styles.textplace, errors.location && styles.errorBorder]}
                            returnKeyType="done"
                            onChangeText={(text) => {
                                setLocation(text);
                                if (text.trim()) setErrors((prev) => ({ ...prev, location: false }));
                            }}
                            onSubmitEditing={handleNextPress}
                            ref={locationRef}
                        />
                    </View>

                    <View style={styles.gocont}>
                        <TouchableOpacity style={styles.nextButton} onPress={handleNextPress}>
                            <Text style={styles.nextText}>التالي</Text>
                            <Image source={next} style={styles.nextimg} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate('profile')}>
                            <Image source={cancel} style={styles.cancelimg} />
                            <Text style={styles.cancelText}>الغاء</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    thecontainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    mainContainer: {
        flex: 1,
    },
    background: {
        width: '100%',
        height: 200,
        position: 'relative',
        fontFamily: 'NotoKufiArabic-Regular',
    },
    topimage: {
        width: '100%',
        height: '110%',
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
        marginTop: -50,
        fontFamily: 'NotoKufiArabic-Regular',
    },
    newcont: {
        flex: 1,
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
        fontFamily: 'NotoKufiArabic-Regular',
    },
    new: {
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: '900',
        fontSize: 40,
        color: '#000000',
        textAlign: 'center',
        fontFamily: 'NotoKufiArabic-Regular',
    },
    input: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        flex: 3,
        fontFamily: 'NotoKufiArabic-Regular',
    },
    inputText: {
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: '1000',
        fontSize: 25,
        color: '#000000',
        textAlign: 'right',
        fontFamily: 'NotoKufiArabic-Regular',
    },
    textplace: {
        backgroundColor: '#D9D9D9',
        fontSize: 20,
        height: 50,
        padding: 10,
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
    // تعديل خصائص الظلال فقط:
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
        fontFamily: 'NotoKufiArabic-Regular',
    },
    nextText: {
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: '800',
        fontSize: 25,
        color: '#000000',
        fontFamily: 'NotoKufiArabic-Regular',
    },
    nextimg: {
        width: 50,
        height: 50,
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
    },
    cancelText: {
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: '800',
        fontSize: 25,
        color: '#000000',
        fontFamily: 'NotoKufiArabic-Regular',
    },
    cancelimg: {
        width: 25,
        height: 25,
        fontFamily: 'NotoKufiArabic-Regular',
    },
});

export default HomePage;
