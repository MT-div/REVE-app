import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import { API_BASE_URL } from './config'; // Make sure this points to your backend base URL

const PropertyBookingsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {}; // property id passed in the navigation params

  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [dayOffBookings, setDayOffBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookingsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/property_bookings/${id}/`);
      if (response.ok) {
        const data = await response.json();
        setAcceptedBookings(data.accepted_reservations);
        setDayOffBookings(data.dayoff_reservations);
      } else {
        console.error("Failed to fetch bookings data");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBookingsData();
  }, [id]);

  const formatArabicDate = (dateStr) => {
    if (!dateStr) return '-/-/2025';
    const date = moment(dateStr);
    return date.isValid() ? date.format('DD/MM/YYYY') : '-/-/2025';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D4FFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('CardDitalsOwner', { id })}
          activeOpacity={0.7}
        >
          <Image
            source={require('@/assets/images/close.png')}
            style={styles.actionIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>حجوزات هذا العقار</Text>
      </View>

      {/* Current Reservations Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>الحجوزات الحالية</Text>
        {acceptedBookings.length > 0 ? (
          acceptedBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.container1}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{booking.user_name}</Text>
                  <Text style={styles.userPhone}>{booking.user_phone}</Text>
                </View>
                <Image
                  source={require('@/assets/images/MaleUser.png')}
                  style={styles.profileImage}
                />
              </View>
              <View style={styles.datesContainer}>
                <Text style={styles.dateText}>
                  {formatArabicDate(booking.start_date)}
                </Text>
                <Text style={styles.arrow}>→</Text>
                <Text style={styles.dateText}>
                  {formatArabicDate(booking.end_date)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>لا توجد حجوزات حالية</Text>
        )}
      </View>

      {/* Days Off Reservations Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>أيام العطلات المحجوزة</Text>
        {dayOffBookings.length > 0 ? (
          dayOffBookings.map((booking) => (
            <View key={booking.id} style={styles.holidayCard}>
              <Text style={styles.holidayReason}>عطلة شخصية</Text>
              <View style={styles.datesContainer}>
                <Text style={styles.dateText}>
                  {formatArabicDate(booking.start_date)}
                </Text>
                <Text style={styles.arrow}>→</Text>
                <Text style={styles.dateText}>
                  {formatArabicDate(booking.end_date)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>لا توجد أيام عطلة محجوزة</Text>
        )}
      </View>

      {/* Fixed Footer with Add Button */}
      <View style={styles.fixedFooter}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('DaysOff', { id })}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>حجز يوم عطلة لك</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F8',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    color: '#2D2D2D',
    fontFamily: 'NotoKufiArabic-Bold',
    textAlign: 'right',
    flex: 1,
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 18,
    color: '#4D4FFF',
    fontFamily: 'NotoKufiArabic-Bold',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 10,
    marginBottom: 15,
    textAlign: 'right',
  },
  bookingCard: {
    backgroundColor: '#F8F8FA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  holidayCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF4444',
  },
  container1: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignContent:'center',
    alignItems:'center',
  },
  userInfo: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    color: '#2D2D2D',
    fontFamily: 'NotoKufiArabic-Bold',
    textAlign: 'right',
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'NotoKufiArabic-Regular',
    textAlign: 'right',
  },
  profileImage: {
    width: 90,
    height: 90,
  },
  datesContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#2D2D2D',
    fontFamily: 'NotoKufiArabic-Medium',
  },
  arrow: {
    fontSize: 16,
    color: '#4D4FFF',
    marginHorizontal: 8,
  },
  holidayReason: {
    fontSize: 14,
    color: '#FF4444',
    fontFamily: 'NotoKufiArabic-Regular',
    textAlign: 'right',
    marginBottom: 5,
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  addButton: {
    backgroundColor: '#4D4FFF',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'NotoKufiArabic-Regular',
  },
});

export default PropertyBookingsScreen;