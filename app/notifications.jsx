import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../src/context/AuthContext'; // Adjust the path if different
import { API_BASE_URL } from './config'; // Your API base URL as configured
import arrow from '@/assets/images/arrow.png';
import Gallary from './gallary';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth(); // Get authenticated user info
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || !user.token) {
        setError('User is not authenticated.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/notifications/`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          },
        });
        // The backend returns a combined notifications list from both models.
        setNotifications(response.data);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        setError('Error fetching notifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);
  const handleReceiveTask = async (clientId) => {
    try {
      console.log("Sending clientId:", clientId);  // Add a log to verify the value
      const response = await axios.post(
        `${API_BASE_URL}/notifications/assign-realestate/`,
        { client_id: clientId },  // Make sure the key is exactly "client_id"
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      console.log('Assignment notification created:', response.data);
      // Update your notifications list or show a success message if needed.
    } catch (err) {
      console.error('Error assigning realestate notification:', err);
    }
  };
  const handleAssignReservation = async (clientId, reservationId) => {
    try {
      console.log("Sending clientId:", clientId, "reservationId:", reservationId);
      const response = await axios.post(
        `${API_BASE_URL}/reservation/assign/`,
        { client_id: clientId, reservation_id: reservationId },  // JSON payload with both fields
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      console.log("Reservation assignment handled:", response.data);
      // Optionally update your notification list or show a success message.
    } catch (err) {
      console.error("Error handling reservation assignment:", err);
    }
  };


  // Map backend notification fields to a display message.
  const getMessage = (notification) => {
    // Using 'notification_type' as returned from backend.
    switch (notification.notification_type) {
      case 'still_pending_user':
        return `تم استلام طلبك لحجز العقار رقم (${notification.propertyId}) وسوف يتم التواصل معك على رقمك لاستلام الدفعة الأولى لتأكيد الحجز.
  تاريخ الحجز: من ${notification.startDate} إلى ${notification.endDate}`;
      case 'accepted_user':
        return `تم تأكيد حجزك للعقار رقم (${notification.propertyId})
  من تاريخ ${notification.startDate} إلى ${notification.endDate}`;
      case 'rejected_user':
        return `تم رفض الحجز للعقار (${notification.propertyId})
  بسبب عدم تسديد الدفعة الأولى
  الاسباب:
  ${notification.rejectionReason || ''}`;
      case 'add_realestate_user':
        return 'تم استلام طلبك لإضافة عقار إلى أفار\nسيتم التواصل معك لمناقشة التفاصيل';
      case 'welcome_user':
        return 'مرحباً بك في أفار\nنافذتك لعالم الراحة في الحجوزات';
      case 'ready_to_assign_reservation_admin':
      case 'accepting_rejecting_reservation_admin':
      case 'accepting_reservation_admin':
        return `تم إرسال طلب لحجز العقار رقم (${notification.propertyId})
  من تاريخ: ${notification.startDate} إلى ${notification.endDate}
  من قبل المستخدم: ${notification.userName}
  ورقم الهاتف: ${notification.userPhone}`;
      case 'rejecting_reservation_admin':
        return `تم إرسال طلب لحجز العقار رقم (${notification.propertyId})
  من تاريخ: ${notification.startDate} إلى ${notification.endDate}
  من قبل المستخدم: ${notification.userName}
  ورقم الهاتف: ${notification.userPhone}
  الاسباب:
  ${notification.rejectionReason || ''}`;
      case 'ready_to_assign_add_realestate_admin':
      case 'got_assigned_add_realestate_admin':
        return `تم إرسال طلب لإضافة عقار
  من قبل المستخدم: ${notification.userName}
  ورقم الهاتف: ${notification.userPhone}`;
      default:
        return '';
    }
  };


  const handleReservationResponse = async (clientId, reservationId, action, reason = "") => {
    try {
      console.log("Sending response with clientId:", clientId, "reservationId:", reservationId, "action:", action, "reason:", reason);
      const response = await axios.post(
        `${API_BASE_URL}/reservation/response/`,
        { client_id: clientId, reservation_id: reservationId, action: action, reason: reason },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      console.log("Reservation response handled:", response.data);
      // Optionally, update your notifications state here.
    } catch (err) {
      console.error("Error handling reservation response:", err);
    }
  };
  // Render action buttons based on the notification type.
  const renderButtons = (notification) => {
    switch (notification.notification_type) {
      // For user notification types related to reservation:
      case 'accepting_reservation_admin':
        return (
          <TouchableOpacity style={[styles.disButton, styles.acceptButton]}>
            <Text style={styles.disText}>تم قبول الطلب</Text>
          </TouchableOpacity>
        );
      case 'rejecting_reservation_admin':
        return (
          <TouchableOpacity style={[styles.disButton, styles.rejectButton]}>
            <Text style={styles.disText}>تم رفض الطلب</Text>
          </TouchableOpacity>
        );
      case 'ready_to_assign_add_realestate_admin':
        return (
          <TouchableOpacity
            style={[styles.disButton, styles.receivedButton]}
            onPress={() => {
              console.log("Notification payload:", notification);
              if (notification.client) {
                handleReceiveTask(notification.client); // We pass the number directly
              }
            }}
          >
            <Text style={styles.disText}>استلام المهمة</Text>
          </TouchableOpacity>



        );

      case 'got_assigned_add_realestate_admin':
        return (
          <TouchableOpacity style={[styles.disButton, styles.receivedButton]} disabled>
            <Text style={styles.disText}>تم استلام المهمة</Text>
          </TouchableOpacity>
        );

      case 'still_pending_user':
      case 'accepted_user':
      case 'rejected_user':
        return (
          <TouchableOpacity
            style={styles.disButton}
            onPress={() =>
              navigation.navigate('CardDitals', {
                id: notification.propertyId,
              })
            }
          >
            <Text style={styles.disText}>عرض العقار</Text>
          </TouchableOpacity>
        );
      // Example for admin actions:   
      case 'ready_to_assign_reservation_admin':
        return (
          <TouchableOpacity
            style={[styles.disButton]}
            onPress={() => {
              console.log("Reservation notification payload:", notification);
              if (notification.client && notification.reservation) {
                console.log("Client:", notification.client, "Reservation:", notification.reservation);
                handleAssignReservation(notification.client, notification.reservation);
              } else {
                console.warn("Client or reservation information is missing!", notification);
              }
            }}
          >
            <Text style={styles.disText}>استلام المهمة</Text>
          </TouchableOpacity>
        );
      // For notifications requiring accept/reject buttons.
      case 'accepting_rejecting_reservation_admin': {
        return (
          <>
            <View style={styles.responseContainer}>
              <TouchableOpacity
                style={[styles.responseButton, styles.acceptButton]}
                onPress={() => {
                  // When accepting, call the endpoint with action "accepted"
                  if (notification.reservation && notification.client) {
                    handleReservationResponse(
                      notification.client,  // client is a primary key number
                      notification.reservation, // reservation (assumed to be an id)
                      "accepted"
                    );
                  } else {
                    console.warn("Missing reservation or client info", notification);
                  }
                }}
              >
                <Text style={styles.buttonText}>قبول</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.responseButton, styles.rejectButton]}
                onPress={() => {
                  // When rejecting, check that a reason has been entered, then call the endpoint.
                  if (notification.reservation && notification.client) {
                    if (rejectReason.trim() !== "") {
                      handleReservationResponse(
                        notification.client,
                        notification.reservation,
                        "rejected",
                        rejectReason
                      );
                    } else {
                      console.warn("Please provide the rejection reason.");
                    }
                  } else {
                    console.warn("Missing reservation or client info", notification);
                  }
                }}
              >
                <Text style={styles.buttonText}>رفض</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.reasonInput}
              placeholder="سبب الرفض..."
              placeholderTextColor="#999"
              onChangeText={text => setRejectReason(text)}
              value={rejectReason}
            />
          </>
        );
      }
      // Add more cases as needed.
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
      <Text style={styles.title}>الإشعارات</Text>
        <TouchableOpacity onPress={() => navigation.navigate('gallary')}>
          <Image source={arrow} style={styles.arrowIcon} />
        </TouchableOpacity>
        
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {notifications.map((notification) => (
          <View key={notification.id} style={styles.notificationCard}>
            <View style={styles.headerRow}>
              <View style={styles.container1}>
                <Image
                  source={require('@/assets/images/MaleUser.png')}
                  style={styles.Person}
                />
                <Text style={styles.adminText}>
                  {notification.user_to && notification.user_to.username
                    ? notification.user_to.username
                    : 'إدارة أفار'}
                </Text>
              </View>
              <Text style={styles.timeText}>
                {new Date(notification.createAt).toLocaleString()}
              </Text>
            </View>

            <Text style={styles.messageText}>{getMessage(notification)}</Text>

            {renderButtons(notification)}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(149, 147, 147, 0.69)',
    paddingBottom: 10,
    paddingTop: 30,
    backgroundColor: '#4d4fff',
  },
  title: {
    fontSize: 25,
    textAlign: 'right',
    marginTop: -8,
    fontFamily: 'NotoKufiArabic-Bold',
    color: '#000',
    flex: 1,
    marginRight: 0,
  },
  arrowIcon: {
    width: 40,
    height: 40,
    marginHorizontal: 10,
    transform: [{ scaleX: 1 }],
  },
  scrollContainer: {
    paddingTop: 10,
    padding: 20,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  container1: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  Person: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 10,
  },
  timeText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  adminText: {
    color: '#2c3e50',
    fontSize: 16,
    fontFamily: 'NotoKufiArabic-Bold',
  },
  messageText: {
    color: '#333',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'right',
    fontFamily: 'NotoKufiArabic-Regular',
    lineHeight: 24,
  },
  disButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#4D4FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderRadius: 10,
    borderColor: '#4D4FFF',
    paddingVertical: 12,
    marginTop: 10,
  },
  disText: {
    fontSize: 20,
    color: '#FFF',
    marginHorizontal: 10,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  responseContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  responseButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    textAlign: 'right',
    fontFamily: 'NotoKufiArabic-Regular',
    color: '#333',
    minHeight: 80,
  },
  receivedButton: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  fullWidthButton: {
    width: '100%',
    marginHorizontal: 0,
  },
  errorInput: {
    borderColor: '#dc3545',
    backgroundColor: '#fff0f0'
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
    fontFamily: 'NotoKufiArabic-Regular'
  },
});

export default NotificationsScreen;