import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CalendarOwner = ({ route }) => {
  const { startDate, endDate } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تحديد التاريخ</Text>
      <Text style={styles.date}>Start Date: {startDate}</Text>
      <Text style={styles.date}>End Date: {endDate}</Text>
      {/* Implement your calendar logic here */}
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  date: {
    fontSize: 18,
    color: 'gray',
  },
});

export default CalendarOwner;
