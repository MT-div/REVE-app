
import back from '@/assets/images/back2.jpg';
import eyeClosed from '@/assets/images/eye-closed.png';
import eyeOpen from '@/assets/images/eye-open.png';
import goback from '@/assets/images/goback.png';
import next from '@/assets/images/next.png';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useRef, useState } from 'react';
import { Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuth } from '../src/context/AuthContext';
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

const SignupUserPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { person_id } = route.params;
  const { login } = useAuth();
  
  // Refs for input fields
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    username: false,
    password: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
const handleNextPress = async () => {
  const newErrors = {
    username: !username.trim(),
    password: !password.trim(),
    confirmPassword: !confirmPassword.trim() || confirmPassword !== password,
  };

  setErrors(newErrors);

  if (newErrors.username || newErrors.password || newErrors.confirmPassword) {
    setErrorMessage('يرجى ملء جميع الحقول الإلزامية بشكل صحيح.');
    setErrorVisible(true);
    return;
  }

  const userData = {
    username: username,
    password: password,
    confirm_password: confirmPassword,
    person_id: person_id,
  };

  try {
    setLoading(true);
    const response = await axios.post(`${API_BASE_URL}/signup1/`, userData);

    if (response.status === 201) {
      await login({
        username: username.trim(),
        access: response.data.access,
        refresh: response.data.refresh,
        user_id: response.data.user_id,
      });
      navigation.navigate("gallary");
    }
  } catch (error) {
    // Extract error data from the backend response
    const errData = error.response?.data;
    let errorMsg = 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.';
    if (errData) {
      if (errData.username) {
        errorMsg = 'استخدم اسم اخر ,لقد تم استخدام هذا الاسم بالفعل';
      } else {
        const firstKey = Object.keys(errData)[0];
        errorMsg = errData[firstKey] || errorMsg;
      }
    }
    setErrorMessage(errorMsg);
    setErrorVisible(true);
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
      <ErrorMessageModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />

      <View style={styles.mainContainer}>
        <View style={styles.background}>
          <Image source={back} style={styles.topimage} />
        </View>

        <View style={styles.container}>
          <View style={styles.newcont}>
            <Text style={styles.new}> اكمال انشاء حساب </Text>
          </View>
<Text style={styles.impty}> </Text>
          <View style={styles.input}>
            <Text style={styles.inputText}>اسم المستخدم</Text>
            <TextInput
              style={[styles.textplace, errors.username && styles.errorBorder]}
              returnKeyType="next"
              autoCapitalize="none"
              onChangeText={(text) => {
                setUsername(text);
                if (text.trim()) setErrors((prev) => ({ ...prev, username: false }));
              }}
              onSubmitEditing={() => passwordRef.current.focus()}
              blurOnSubmit={false}
              ref={usernameRef}
            />

            <Text style={styles.inputText}>كلمة المرور</Text>
<View style={styles.passwordContainer}>
  <TextInput
    style={[styles.passwordInput, errors.password && styles.errorBorder]}
    secureTextEntry={!showPassword}
    returnKeyType="next"
    autoCapitalize="none"
    onChangeText={(text) => {
      setPassword(text);
      if (text.trim()) setErrors((prev) => ({ ...prev, password: false }));
    }}
    onSubmitEditing={() => confirmPasswordRef.current.focus()}
    blurOnSubmit={false}
    ref={passwordRef}
  />
  <TouchableOpacity
    style={styles.eyeIcon}
    onPress={() => setShowPassword(!showPassword)}
  >
    <Image
      source={showPassword ? eyeOpen : eyeClosed}
      style={styles.eyeIconImage}
    />
  </TouchableOpacity>
</View>

<Text style={styles.inputText}>تاكيد كلمة المرور</Text>
<View style={styles.passwordContainer}>
  <TextInput
    style={[styles.passwordInput, errors.confirmPassword && styles.errorBorder]}
    secureTextEntry={!showConfirmPassword}
    returnKeyType="done"
    autoCapitalize="none"
    onChangeText={(text) => {
      setConfirmPassword(text);
      if (text.trim() && text === password)
        setErrors((prev) => ({ ...prev, confirmPassword: false }));
    }}
    onSubmitEditing={handleNextPress}
    ref={confirmPasswordRef}
  />
  <TouchableOpacity
    style={styles.eyeIcon}
    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
  >
    <Image
      source={showConfirmPassword ? eyeOpen : eyeClosed}
      style={styles.eyeIconImage}
    />
  </TouchableOpacity>
</View>
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
    fontFamily: 'NotoKufiArabic',
    fontStyle: 'normal',
    fontWeight: '900',
    fontSize: 40,
    color: '#4D4FFF',
    textAlign: 'center',
  },
  impty:{
fontSize:20,
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
    fontFamily: 'NotoKufiArabic-Regular',
    fontStyle: 'normal',
    fontWeight: '800',
    fontSize: 25,
    color: '#FFF',
  },
  nextimg: {
    tintColor:'#FFF',
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
    backgroundColor: '#4D4FFF',
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
    fontFamily: 'NotoKufiArabic-Regular',
    fontStyle: 'normal',
    fontWeight: 800,
    fontSize: 25,
    color: '#FFF',
  },
  cancelimg: {
    width: 50,
    height: 50,
    tintColor:'#FFF'
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
  passwordContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#D1D1D6',
  borderRadius: 10,
  backgroundColor: '#fff',
  marginBottom: 10,
},
passwordInput: {
  flex: 1,
  height: 50,
  paddingHorizontal: 15,
  fontSize: 20,
  textAlign:'right'
},
eyeIcon: {
  padding: 10,
  backgroundColor: '#fff',
  borderWidth: 0,
},
eyeIconImage: {
  width: 24,
  height: 24,
},
errorBorder: {
  borderColor: 'red',
  borderWidth: 1,
},
});

export default SignupUserPage;