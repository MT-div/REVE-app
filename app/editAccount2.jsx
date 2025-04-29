import React, { useRef, useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import back from '@/assets/images/back2.jpg';
import next from '@/assets/images/next.png';
import goback from '@/assets/images/goback.png';

const HomePage = () => {
    const navigation = useNavigation();

    // مراجع الإدخالات
    const usernameRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    // حالة تتبع المدخلات وصحة الحقول
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({
        username: false,
        password: false,
        confirmPassword: false,
    });

    // التحقق من صحة الإدخالات
    const handleConfirmPress = () => {
        const newErrors = {
            username: !username.trim(),
            password: !password.trim(),
            confirmPassword: !confirmPassword.trim() || confirmPassword !== password, // التحقق من مطابقة كلمة المرور
        };

        setErrors(newErrors);

        // إذا لم تكن هناك أخطاء، الانتقال للشاشة التالية
        if (!newErrors.username && !newErrors.password && !newErrors.confirmPassword) {
            navigation.navigate('confedit');
        } else {
            Alert.alert('خطأ', 'يرجى ملء جميع الحقول الإلزامية بشكل صحيح.');
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
                        <Text style={styles.new}>اكمال تعديل الحساب</Text>
                    </View>

                    <View style={styles.input}>
                        <Text style={styles.inputText}>اسم المستخدم</Text>
                        <TextInput
                            style={[styles.textplace, errors.username && styles.errorBorder]}
                            returnKeyType="next"
                            onChangeText={(text) => {
                                setUsername(text);
                                if (text.trim()) setErrors((prev) => ({ ...prev, username: false }));
                            }}
                            onSubmitEditing={() => emailRef.current.focus()}
                            blurOnSubmit={false}
                            ref={usernameRef}
                        />

                        <Text style={styles.inputText}>
                            الايميل <Text style={styles.chosentext}>(اختياري)</Text>
                        </Text>
                        <TextInput
                            style={styles.textplace}
                            keyboardType="email-address"
                            returnKeyType="next"
                            onChangeText={(text) => {
                                setEmail(text);
                            }}
                            onSubmitEditing={() => passwordRef.current.focus()}
                            blurOnSubmit={false}
                            ref={emailRef}
                        />

                        <Text style={styles.inputText}>كلمة المرور</Text>
                        <TextInput
                            style={[styles.textplace, errors.password && styles.errorBorder]}
                            secureTextEntry
                            returnKeyType="next"
                            onChangeText={(text) => {
                                setPassword(text);
                                if (text.trim()) setErrors((prev) => ({ ...prev, password: false }));
                            }}
                            onSubmitEditing={() => confirmPasswordRef.current.focus()}
                            blurOnSubmit={false}
                            ref={passwordRef}
                        />

                        <Text style={styles.inputText}>تاكيد كلمة المرور</Text>
                        <TextInput
                            style={[styles.textplace, errors.confirmPassword && styles.errorBorder]}
                            secureTextEntry
                            returnKeyType="done"
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (text.trim() && text === password)
                                    setErrors((prev) => ({ ...prev, confirmPassword: false }));
                            }}
                            onSubmitEditing={handleConfirmPress} // تأكيد عند الضغط على زر "تم"
                            ref={confirmPasswordRef}
                        />
                    </View>

                    <View style={styles.gocont}>
                        <TouchableOpacity style={styles.nextButton} onPress={handleConfirmPress}>
                            <Text style={styles.nextText}>تأكيد</Text>
                            <Image source={next} style={styles.nextimg} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate('newAccount')}>
                            <Image source={goback} style={styles.cancelimg} />
                            <Text style={styles.cancelText}>رجوع</Text>
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
        backgroundColor: '#fff',
        padding: 30,
        flexGrow: 1,
        borderTopLeftRadius: 70,
        borderTopRightRadius: 70,
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
        flex: 3.5,
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
    chosentext: {
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: '200',
        fontSize: 20,
        color: '#000000',
        textAlign: 'right',
        marginRight: -10,
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
        fontFamily: 'NotoKufiArabic-Regular',
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
        fontFamily: 'NotoKufiArabic-Regular',
    },
    nextText: {
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: 800,
        fontSize: 25,
        color: '#000000',
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
        backgroundColor: '#4D4FFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 15,
    },
    cancelText: {
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: 800,
        fontSize: 25,
        color: '#000000',
        fontFamily: 'NotoKufiArabic-Regular',
    },
    cancelimg: {},
});

export default HomePage;
