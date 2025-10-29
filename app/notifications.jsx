
import arrow from '@/assets/images/arrow.png';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { API_BASE_URL } from './config/config';

// Add ErrorMessageModal component
const ErrorMessageModal = ({ visible, message, onClose, onRetry }) => {
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
                        <View style={styles.errorModalButtons}>
                            <TouchableOpacity
                                style={styles.errorModalButton}
                                onPress={onClose}
                            >
                                <Text style={styles.errorModalButtonText}>موافق</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const NotificationsScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorVisible, setErrorVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user || !user.token) {
                setErrorMessage('يجب تسجيل الدخول أولاً');
                setErrorVisible(true);
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${API_BASE_URL}/notifications/`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    },
                });
                setNotifications(response.data);
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
                setErrorMessage('فشل في تحميل الإشعارات. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى');
                setErrorVisible(true);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user, refresh]);

    const handleReceiveTask = async (clientId) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/notifications/assign-realestate/`,
                { client_id: clientId },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setRefresh(!refresh);
        } catch (err) {
            console.error('Error assigning realestate notification:', err);
            setErrorMessage('فشل في استلام المهمة');
            setErrorVisible(true);
        }
    };

    const handleAssignReservation = async (clientId, reservationId) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/reservation/assign/`,
                { client_id: clientId, reservation_id: reservationId },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setRefresh(!refresh);
        } catch (err) {
            console.error("Error handling reservation assignment:", err);
            setErrorMessage('فشل في تعيين الحجز');
            setErrorVisible(true);
        }
    };

    const getMessage = (notification) => {
        switch (notification.notification_type) {
                        case 'write_message':
                return `${notification.message}`;


            case 'still_pending_user':
                return `تم استلام طلبك لحجز العقار رقم (${notification.propertyId}) وسوف يتم التواصل معك على رقمك لاستلام الدفعة الأولى لتأكيد الحجز.
تاريخ الحجز: من ${notification.startDate} إلى ${notification.endDate}`;


            case 'accepted_user':
                return `تم تأكيد حجزك للعقار رقم (${notification.propertyId})
من تاريخ ${notification.startDate} إلى ${notification.endDate}`;
            case 'rejected_user':
                return `تم رفض الحجز للعقار (${notification.propertyId})
بسبب:
${notification.rejectionReason || ''}`;
            case 'add_realestate_user':
                return 'تم استلام طلبك لإضافة عقار إلى RÊVE\nسيتم التواصل معك لمناقشة التفاصيل';
            case 'welcome_user':
                return 'مرحباً بك في RÊVE\nنافذتك لعالم الراحة في الحجوزات';
            case 'ready_to_assign_reservation_admin':
            case 'accepting_rejecting_reservation_admin':
            case 'accepting_reservation_admin':
 return `تم إرسال طلب لحجز العقار رقم (${notification.propertyId})
من تاريخ: ${notification.startDate} إلى ${notification.endDate}
من قبل المستخدم: ${notification.userName}
ورقم الهاتف: ${notification.userPhone}`;

            case 'res_accepted_to_Owner':
return `تم تاكيد الطلب لحجز عقارك رقم (${notification.propertyId})
من تاريخ: ${notification.startDate} إلى ${notification.endDate}
من قبل المستخدم: ${notification.userName}
ورقم الهاتف: ${notification.userPhone}`;

 case 'res_rejected_to_Owner':
 return `تم رفض الطلب لحجز عقارك رقم (${notification.propertyId})
من تاريخ: ${notification.startDate} إلى ${notification.endDate}
الاسباب:
${notification.rejectionReason || ''}`;
;

 case 'res_pending_to_Owner':
return `تم ارسال الطلب لحجز عقارك رقم (${notification.propertyId})
من تاريخ: ${notification.startDate} إلى ${notification.endDate}
 سوف يتم التواصل معك لتاكيد او رفض الحجز
`;
;
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
            const response = await axios.post(
                `${API_BASE_URL}/reservation/response/`,
                { client_id: clientId, reservation_id: reservationId, action: action, reason: reason },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
           
            setRefresh(!refresh);
        } catch (err) {
            console.error("Error handling reservation response:", err);
            setErrorMessage('فشل في معالجة طلب الحجز');
            setErrorVisible(true);
        }
    };

    const renderButtons = (notification) => {
        switch (notification.notification_type) {
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
                            if (notification.client) {
                                handleReceiveTask(notification.client);
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
            case 'res_accepted_to_Owner':
            case 'res_rejected_to_Owner':
            case 'res_pending_to_Owner':
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
            case 'ready_to_assign_reservation_admin':
                return (
                    <TouchableOpacity 
                        style={[styles.disButton]}
                        onPress={() => {
                            if (notification.client && notification.reservation) {
                                handleAssignReservation(notification.client, notification.reservation);
                            }
                        }}
                    >
                        <Text style={styles.disText}>استلام المهمة</Text>
                    </TouchableOpacity>
                );
            case 'accepting_rejecting_reservation_admin': {
                return (
                    <>
                        <View style={styles.responseContainer}>
                            <TouchableOpacity 
                                style={[styles.responseButton, styles.acceptButton]}
                                onPress={() => {
                                    if (notification.reservation && notification.client) {
                                        handleReservationResponse(
                                            notification.client,
                                            notification.reservation,
                                            "accepted"
                                        );
                                    }
                                }}
                            >
                                <Text style={styles.buttonText}>قبول</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.responseButton, styles.rejectButton]}
                                onPress={() => {
                                    if (notification.reservation && notification.client) {
                                        if (rejectReason.trim() !== "") {
                                            handleReservationResponse(
                                                notification.client,
                                                notification.reservation,
                                                "rejected",
                                                rejectReason
                                            );
                                        } else {
                                            setErrorMessage('يرجى إدخال سبب الرفض');
                                            setErrorVisible(true);
                                        }
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

    return (
        <SafeAreaView style={styles.container}>
            <ErrorMessageModal
                visible={errorVisible}
                message={errorMessage}
                onClose={() => {
                    setErrorVisible(false);
                    if (errorMessage === 'يجب تسجيل الدخول أولاً') {
                        navigation.navigate('loginpage');
                    }
                }}
            />
            
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('gallary')}>
                    <Image source={arrow} style={styles.arrowIcon} />
                </TouchableOpacity>
                <Text style={styles.title}>الإشعارات</Text>
            </View>

           <FlatList
  data={notifications}
  renderItem={({ item, index }) => (
    <View style={styles.notificationCard}>
      <View style={styles.headerRow}>
        <View style={styles.container1}>
          <Image source={require('@/assets/images/MaleUser.png')} style={styles.Person} />
          <Text style={styles.adminText}>
            {item.user_to && item.user_to.username ? item.user_to.username : 'RÊVE'}
          </Text>
        </View>
        <Text style={styles.timeText}>{new Date(item.createAt).toLocaleString()}</Text>
      </View>

      <Text style={styles.messageText}>{getMessage(item)}</Text>

      {renderButtons(item)}
    </View>
  )}
  keyExtractor={(item, index) => `notif-${item.id}-${index}`} // يضمن أن المفتاح فريد
  contentContainerStyle={styles.scrollContainer}
  showsVerticalScrollIndicator={false}
/>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    headerContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'rgba(149, 147, 147, 0.69)',
        paddingBottom: 10,
        paddingTop: 30,
        paddingRight:10,
        backgroundColor: '#4d4fff',
    },
    title: {
        fontSize: 25,
        textAlign: 'right',
        marginTop: -8,
        fontFamily: 'NotoKufiArabic-Bold',
        color: '#000',
        flex: 1,
        marginRight: 16,
    },
    arrowIcon: {
        width: 40,
        height: 40,
        marginHorizontal: 10,
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
        tintColor:'#4d4fff',
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
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical:2,
        fontFamily: 'NotoKufiArabic-Regular',
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
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical:2,
        fontFamily: 'NotoKufiArabic-Regular',
    },
    rejectButton: {
        backgroundColor: '#dc3545',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical:2,
        fontFamily: 'NotoKufiArabic-Regular',
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
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
    errorModalButtons: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 15,
    },
    errorModalButton: {
        backgroundColor: '#4D4FFF',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 25,
        minWidth: 100,
        alignItems: 'center',
    },
    retryButton: {
        backgroundColor: '#2ecc71',
        marginLeft: 10,
    },
    errorModalButtonText: {
        color: '#fff',
        fontFamily: 'NotoKufiArabic-Bold',
        fontSize: 16,
    },
});

export default NotificationsScreen;