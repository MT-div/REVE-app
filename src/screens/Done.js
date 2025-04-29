import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Done = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>تم إرسال طلب الحجز بنجاح!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  message: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4D4FFF',
  },
});

export default Done;
