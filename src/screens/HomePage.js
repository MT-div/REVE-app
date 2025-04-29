import React from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import back from '@/assets/images/back.jpg';
import logoimg from '@/assets/images/logoimg.png';

const HomePage = () => {
  const navigation = useNavigation();

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
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => navigation.navigate('loginpage')}
          >
            <Text style={styles.loginButtonText}>تسجيل دخول</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.guestButton} 
            onPress={() => navigation.navigate('gallary')}
          >
            <Text style={styles.guestButtonText}>متابعة كضيف</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.privacycontainer}>
          <TouchableOpacity 
            style={styles.privacyButton} 
            onPress={() => navigation.navigate('Privacy')}
          >
            <Text style={styles.privacyText}>بنود الخدمة و الخصوصية</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

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
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  logocontainer: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: "90%",
    resizeMode: 'contain',
  },
  btns: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  loginButton: {
    width: 241,
    height: 54,
    backgroundColor: '#4D4FFF',
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
  },
  loginButtonText: {
    fontFamily: 'Inter',
    fontWeight: '800',
    fontSize: 18,
    color: '#FFFFFF',
  },
  guestButton: {
    width: 241,
    height: 54,
    backgroundColor: '#4D4FFF',
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
  },
  guestButtonText: {
    fontFamily: 'Inter',
    fontWeight: '800',
    fontSize: 18,
    color: '#FFFFFF',
  },
  privacycontainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 60,
  },
  privacyButton: {},
  privacyText: {
    fontFamily: 'Inter',
    fontStyle: 'italic',
    fontWeight: '600',
    fontSize: 12,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});

export default HomePage;