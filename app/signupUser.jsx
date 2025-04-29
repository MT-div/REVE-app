import React, { useRef, useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import { API_BASE_URL } from './config'; // Ensure your API_BASE_URL is set correctly
import { useAuth } from '../src/context/AuthContext';
import back from '@/assets/images/back2.jpg';
import next from '@/assets/images/next.png';
import cancel from '@/assets/images/cancel.png';
import goback from '@/assets/images/goback.png';

const SignupUserPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { person_id } = route.params; // Retrieve person_id passed from the previous sign-up step
  const { login } = useAuth(); // Get the login function from AuthContext

  // Input refs
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // State for inputs and error management
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    username: false,
    password: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);

  // Validate inputs before proceeding and submit data to Django
  const handleNextPress = async () => {
    const newErrors = {
      username: !username.trim(),
      password: !password.trim(),
      confirmPassword: !confirmPassword.trim() || confirmPassword !== password,
    };

    setErrors(newErrors);

    if (newErrors.username || newErrors.password || newErrors.confirmPassword) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول الإلزامية بشكل صحيح.');
      return;
    }

    // Prepare data to send to UserSignUpView
    const userData = {
      username: username,
      password: password,
      confirm_password: confirmPassword, // Make sure this key matches what your serializer expects
      person_id: person_id,            // Link to the previously created person
    };

    try {
      setLoading(true);
      // Adjust the URL below according to your Django URL configuration for UserSignUpView
      const response = await axios.post(`${API_BASE_URL}/signup1/`, userData);

      if (response.status === 201) {
        Alert.alert("نجاح", "تم إنشاء الحساب بنجاح!");
        // Automatically log in the user with the returned tokens and user_id.
        // The response from UserSignUpView contains 'access', 'refresh', and 'user_id'
        await login({
          username: username.trim(),
          access: response.data.access,
          refresh: response.data.refresh,
          user_id: response.data.user_id,
        });
        // Navigate to the desired authenticated screen (e.g., 'gallary')
        navigation.navigate("gallary");
      } else {
        Alert.alert("خطأ", "حدث خطأ أثناء إنشاء الحساب");
      }
    } catch (error) {
      console.error("SignupUser error:", error.response?.data || error.message);
      // Check if the error response contains username errors and display a custom message
      if (error.response && error.response.data && error.response.data.username) {
        Alert.alert('خطأ', 'استخدم اسم اخر ,لقد تم استخدام هذا الاسم بالفعل ');
      } else {
        Alert.alert(
          'خطأ',
          error.response?.data?.error || 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.'
        );
      }
    } finally {
      setLoading(false);
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
            <Text style={styles.new}> اكمال انشاء حساب </Text>
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
              onSubmitEditing={() => passwordRef.current.focus()}
              blurOnSubmit={false}
              ref={usernameRef}
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
              onSubmitEditing={handleNextPress}
              ref={confirmPasswordRef}
            />
          </View>

          <View style={styles.gocont}>
            <TouchableOpacity style={styles.nextButton} onPress={handleNextPress} disabled={loading}>
              <Text style={styles.nextText}>
                {loading ? "تحميل..." : "التالي"}
              </Text>
              <Image source={next} style={styles.nextimg} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate('loginpage')}>
              <Image source={goback} style={styles.cancelimg} />
              <Text style={styles.cancelText}>رجوع</Text>
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
        backgroundColor: '#F7F7F7',
        padding: 30,
        flexGrow: 1,
        borderTopLeftRadius: 70,
        borderTopRightRadius: 70,
        marginTop: -50,

    },
    newcont: {
        flex: 1,
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
marginTop:-15,

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
        backgroundColor: '#fff',
        shadowColor: '#000',
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
        fontWeight: '800',
        fontSize: 25,
        color: '#4D4FFF',
    },
    nextimg: {
      tintColor:'#4D4FFF',
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
      backgroundColor: '#fff',
      shadowColor: "#000",
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
      fontWeight: 800,
      fontSize: 25,
      color: '#4D4FFF',
  },
  cancelimg: {
    width: 50,
    height: 50,
    tintColor:'#4D4FFF'
  },
});

export default SignupUserPage;
