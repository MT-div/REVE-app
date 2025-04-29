import React, { useEffect } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import back from '@/assets/images/16.png';
import logoimg from '@/assets/images/splash.png';
import { scale } from '../src/utils/scaling';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/context/AuthContext';

const HomePage = () => {
  const navigation = useNavigation();
  const { login, user } = useAuth();

  useEffect(() => {
    // Only automatically navigate if the user is fully authenticated.
    if (user && user.token ) {
      console.log("112  2211");
      console.log(user.token);
      navigation.navigate('gallary');
    }
  }, [user, navigation]);
  
  return (
    <ImageBackground
      source={back}
      style={styles.background}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <View style={styles.logocontainer}>
          <Image source={logoimg} style={styles.logo} />
        </View>

        <View style={styles.btns}>
          <Animatable.View
            animation="bounceIn"
            delay={500}
            duration={1500}
          >
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('loginpage')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginButtonText}>تسجيل دخول</Text>
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View
            animation="bounceIn"
            delay={800}
            duration={1500}
          >
            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => navigation.navigate('gallary')}
              activeOpacity={0.7}

            >
              <Text style={styles.guestButtonText}>متابعة كضيف</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>

        <Animatable.View
          style={styles.privacycontainer}
          animation="fadeIn"
          delay={1200}
        >
          <TouchableOpacity
            style={styles.privacyButton}
            onPress={() => navigation.navigate('Privacy')}
          >
            <Text style={styles.privacyText}>بنود الخدمة و الخصوصية</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </ImageBackground>
  );
}

// الأنماط تبقى كما هي بدون تغيير
const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
  },
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  logocontainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 3,
    position: 'relative', // مهم لتحديد الموضع النسبي
    overflow: 'hidden', //
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50, // اختياري لزوايا مدورة
  },
  logo: {
    width: '60%',
    height: '50%',
    marginTop: 80,
    zIndex: 1, //

  },
  btns: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
    opacity: 0.75,
  },
  loginButton: {
    width: 240,
    height: 55,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderColor: '#4D4FFF',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',


  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'NotoKufiArabic-Bold',
    color: '#4D4FFF',
  },
  guestButton: {
    width: 240,
    height: 55,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderColor: '#4D4FFF',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',

  },
  guestButtonText: {
    fontSize: 16,
    fontFamily: 'NotoKufiArabic-Bold',
    color: '#4D4FFF',
  },
  privacycontainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  privacyButton: {
    marginBottom: 80,
  },
  privacyText: {
    fontFamily: 'NotoKufiArabic-Bold',
    fontSize: 14,
    color: '#000',
    textDecorationLine: 'underline',
  },
});


export default HomePage;