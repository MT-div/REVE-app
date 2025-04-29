import React, { useRef, useState } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';
import { useAuth } from '../src/context/AuthContext';
import back from '@/assets/images/back2.jpg';
import next from '@/assets/images/next.png';
import cancel from '@/assets/images/cancel.png';
const NewAccount = ({ route }) => {
    const navigation = useNavigation();
    const { updateUser } = useAuth();
    
    const personId = route.params?.personId;  // Retrieve the person_id from navigation

    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({ 
        username: false, 
        password: false, 
        confirmPassword: false 
    });
    const [loading, setLoading] = useState(false);

    const validateInputs = () => {
        const newErrors = {
            username: !username.trim(),
            password: password.length < 8,
            confirmPassword: password !== confirmPassword
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const handleSignup = async () => {
        if (!validateInputs()) {
            Alert.alert('خطأ', 'الحقول التالية مطلوبة:', [
                { text: 'موافق', onPress: () => handleFocusErrorField() }
            ]);
            return;
        }

        setLoading(true);
        
        try {
            // Send sign-up request
            const response = await axios.post(
                `${API_BASE_URL}/signup1/`,
                {
                    username: username.trim(),
                    password: password.trim(),
                    confirm_password: confirmPassword.trim(),
                    person_id: personId  // Include person_id in request
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            // Check if both tokens are available in the response
            if (!response.data?.access || !response.data?.refresh) {
                throw new Error('لم يتم استلام التوكن من الخادم');
            }

            // Save both tokens to AsyncStorage so that they are available for logout and other authenticated requests
            await AsyncStorage.multiSet([
                ['authToken', response.data.access],
                ['refreshToken', response.data.refresh]
            ]);
            
            // Update Auth context with both tokens
            updateUser({ 
                token: response.data.access,
                refreshToken: response.data.refresh,
                tempUsername: username.trim(),
                authStage: 'step1_completed'
            });
            console.log("heeeeeeeerer")
            console.log('going to newAccount2')

            navigation.navigate('gallary', {
                tempToken: response.data.access,
                tempUsername: username.trim()
            });

        } catch (error) {
            console.error('API Error:', {
                code: error.code,
                message: error.message,
                response: error.response?.data
            });
            
            let errorMessage = 'فشل في الاتصال بالخادم';
            
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'تجاوز الوقت المحدد. يرجى التحقق من اتصال الإنترنت وإعادة المحاولة';
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = 'تعذر الاتصال بالخادم. تأكد من اتصالك بالإنترنت';
            } else if (error.response) {
                if (error.response.data?.username) {
                    errorMessage = 'اسم المستخدم موجود مسبقاً';
                } else if (error.response.data?.password) {
                    errorMessage = 'كلمة المرور غير صالحة';
                } else {
                    errorMessage = error.response.data?.detail || 'حدث خطأ غير متوقع';
                }
            }
            
            Alert.alert('خطأ في التسجيل', errorMessage, [
                { text: 'إعادة المحاولة', onPress: () => handleSignup() },
                { text: 'إلغاء', style: 'cancel' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleFocusErrorField = () => {
        if (errors.username) {
            usernameRef.current.focus();
        } else if (errors.password) {
            passwordRef.current.focus();
        } else {
            confirmPasswordRef.current.focus();
        }
    };

    return (
        <KeyboardAwareScrollView
            style={styles.thecontainer}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={20}
        >
            <View style={styles.mainContainer}>
                <View style={styles.background}>
                    <Image 
                        source={back} 
                        style={styles.topimage}
                        resizeMode="cover"
                    />
                </View>

                <View style={styles.container}>
                    <View style={styles.newcont}>
                        <Text style={styles.new}>إنشاء حساب جديد</Text>
                    </View>

                    <View style={styles.input}>
                        <Text style={styles.inputText}>اسم المستخدم</Text>
                        <TextInput
                            ref={usernameRef}
                            style={[
                                styles.textplace, 
                                errors.username && styles.errorBorder
                            ]}
                            value={username}
                            onChangeText={text => {
                                setUsername(text);
                                setErrors(prev => ({...prev, username: false}));
                            }}
                            autoCapitalize="none"
                            placeholder="اسم المستخدم..."
                            placeholderTextColor="#666"
                            returnKeyType="next"
                            onSubmitEditing={() => passwordRef.current?.focus()}
                        />

                        <Text style={styles.inputText}>كلمة المرور (8 أحرف على الأقل)</Text>
                        <TextInput
                            ref={passwordRef}
                            style={[
                                styles.textplace, 
                                errors.password && styles.errorBorder
                            ]}
                            value={password}
                            onChangeText={text => {
                                setPassword(text);
                                setErrors(prev => ({...prev, password: false}));
                            }}
                            secureTextEntry
                            placeholder="••••••••"
                            placeholderTextColor="#666"
                            returnKeyType="next"
                            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                        />

                        <Text style={styles.inputText}>تأكيد كلمة المرور</Text>
                        <TextInput
                            ref={confirmPasswordRef}
                            style={[
                                styles.textplace, 
                                errors.confirmPassword && styles.errorBorder
                            ]}
                            value={confirmPassword}
                            onChangeText={text => {
                                setConfirmPassword(text);
                                setErrors(prev => ({...prev, confirmPassword: false}));
                            }}
                            secureTextEntry
                            placeholder="••••••••"
                            placeholderTextColor="#666"
                            returnKeyType="done"
                            onSubmitEditing={handleSignup}
                        />
                    </View>

                    <View style={styles.gocont}>
                        <TouchableOpacity 
                            style={[
                                styles.nextButton,
                                loading && {opacity: 0.7}
                            ]} 
                            onPress={handleSignup}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator 
                                    color="#FFF" 
                                    size="small"
                                    style={{marginHorizontal: 10}}
                                />
                            ) : (
                                <>
                                    <Text style={styles.nextText}>التالي</Text>
                                    <Image 
                                        source={next} 
                                        style={styles.nextimg}
                                    />
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.cancelButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.8}
                        >
                            <Image 
                                source={cancel} 
                                style={styles.cancelimg} 
                            />
                            <Text style={styles.cancelText}>إلغاء</Text>
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
    },
    topimage: {
        width: '100%',
        height: '110%',
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
        fontSize: 30,
        color: '#000000',
        textAlign: 'center',
        fontFamily: 'NotoKufiArabic-Bold',
    },
    input: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        flex: 3,
        fontFamily: 'NotoKufiArabic-Regular',
    },
    inputText: {
        fontSize: 20,
        color: '#000000',
        textAlign: 'right',
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
        backgroundColor: '#E0E0E0',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 15,
        fontFamily: 'NotoKufiArabic-Regular',
    },
    cancelText: {
        fontSize: 23,
        color: '#000000',
        fontFamily: 'NotoKufiArabic-Regular',
        marginTop: -10,
    },
    cancelimg: {
        width: 25,
        height: 25,
    },
});

export default NewAccount;