import React from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router'; // Using expo-router hook for params
import conficon from '@/assets/images/conficon.png';

const Done = () => {
  const navigation = useNavigation();
  // Grab the id passed from the previous screen (e.g., HajesAqar)
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.welAvar}>تم استلام طلبك بنجاح</Text>
      <Text style={styles.urwindow}>سيتم التواصل معك من قبل AVAR لتأكيد حجزك</Text>
      <Text style={styles.urwindow}>شكرا لإستعمالك  AVAR</Text>
      <View style={styles.confcont}>
        <TouchableOpacity
          style={styles.conf}
          // Pass the id to CardDitals to ensure it refreshes correctly
          onPress={() => navigation.navigate('CardDitals', { id })}
        >
          <Text style={styles.confText}>موافق</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};



const styles = StyleSheet.create({


  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    fontFamily: 'NotoKufiArabic-Regular',
    paddingTop: 50,
  },
  welcome: {
    flex: 4,
    maxWidth: '99%',
  },
  welAvar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 30,
    color: '#000000',
    textAlign: 'center',
    textAlign: 'center',
    flex: 1,
    fontFamily: 'NotoKufiArabic-Bold',
  },

  urwindow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: 20,
    color: '#000000',
    height: 100,
    textAlign: 'center',
    letterSpacing: 1,
    flex: 1,
    fontFamily: 'NotoKufiArabic-Regular',
  },

  confcont: {

    flex: 1.5,
  },
  conf: {
    width: 240,
    height: 55,
    backgroundColor: '#4D4FFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.45)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,

  },
  confText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'NotoKufiArabic-Regular',
  },



});

export default Done;
