import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList, Image, ScrollView,
  StyleSheet,
  Text, TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { API_BASE_URL } from './config/config';
import GestureRecognizer from 'react-native-swipe-gestures';
import close from '@/assets/images/close.png';

const Calendar = () => {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null });
  const [bookedDays, setBookedDays] = useState({});

  const arabicMonths = [
    'كانون الثاني', 'شباط', 'آذار', 'نيسان',
    'أيار', 'حزيران', 'تموز', 'آب',
    'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
  ];

  useEffect(() => {
    const fetchReservedDates = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/get_accepted_reservations/${id}`,
          { headers: { 'Authorization': `Bearer ${user?.token}` } }
        );
        const datesBooked = {};
        response.data.forEach((reservation) => {
          let start = moment(reservation.start_date);
          let end = moment(reservation.end_date);
          while (start.isSameOrBefore(end)) {
            const dayStr = start.format('YYYY-MM-DD');
            const newReservation = {
              status: reservation.status,
              isMine: reservation.user_name === user.username
            };
            if (datesBooked[dayStr]) {
              if (
                datesBooked[dayStr].status === "pending" &&
                (reservation.status === "accepted" || reservation.status === "DayOff")
              ) {
                datesBooked[dayStr] = newReservation;
              } else if (!datesBooked[dayStr].isMine && newReservation.isMine) {
                datesBooked[dayStr] = newReservation;
              }
            } else {
              datesBooked[dayStr] = newReservation;
            }
            start.add(1, 'days');
          }
        });
        setBookedDays(datesBooked);
      } catch (error) {
        console.error("Error fetching reservation periods:", error);
      }
    };

    if (user && user.token) fetchReservedDates();
  }, [id, user]);

  const isPast = (day) => day.isBefore(moment(), 'day');
  const getReservation = (day) => day ? bookedDays[day.format('YYYY-MM-DD')] : null;
  const isReserved = (day) => !!getReservation(day);

  const generateMonth = () => {
    const startOfMonth = currentDate.clone().startOf('month');
    const endOfMonth = currentDate.clone().endOf('month');
    const weeks = [];
    let currentWeek = [];
    let currentDay = startOfMonth.clone();

    const firstDayOfWeek = startOfMonth.day();
    for (let i = 0; i < firstDayOfWeek; i++) currentWeek.push(null);

    while (currentDay.isSameOrBefore(endOfMonth)) {
      currentWeek.push(currentDay.clone());
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentDay.add(1, 'day');
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }
    return weeks;
  };

  const isSelected = (day) => {
    if (!day || !selectedRange.start) return false;
    if (!selectedRange.end) return day.isSame(selectedRange.start, 'day');
    return day.isBetween(selectedRange.start, selectedRange.end, null, '[]');
  };

  const handleDayPress = (day) => {
    // Allow pressing if the day is either not reserved at all or reserved as pending.
    const dayRes = getReservation(day);
    if (isPast(day) || (dayRes && (dayRes.status === "accepted" || dayRes.status === "DayOff"))) {
      return;
    }
  
    // If no start is set or if the range has already been completed, start a new selection.
    if (!selectedRange.start || selectedRange.end) {
      setSelectedRange({ start: day, end: null });
      return;
    }
  
    // Determine the boundaries independent of click order.
    let rangeStart, rangeEnd;
    if (day.isSameOrAfter(selectedRange.start)) {
      rangeStart = selectedRange.start.clone();
      rangeEnd = day.clone();
    } else {
      rangeStart = day.clone();
      rangeEnd = selectedRange.start.clone();
    }
  
    // Look through each day in the range to ensure there’s no "accepted" or "DayOff" day.
    let current = rangeStart.clone();
    let invalid = false;
    while (current.isSameOrBefore(rangeEnd)) {
      const res = getReservation(current);
      if (res && (res.status === "accepted" || res.status === "DayOff")) {
        invalid = true;
        break;
      }
      current.add(1, "day");
    }
  
    if (invalid) {
      Alert.alert("خطأ", "لا يمكنك اختيار فترة تحتوي على أيام محجوزة مسبقاً");
      return;
    }
  
    // Update the selected range with the second day.
    if (day.isSameOrAfter(selectedRange.start)) {
      setSelectedRange({ ...selectedRange, end: day });
    } else {
      setSelectedRange({ start: day, end: selectedRange.start });
    }
  };
  
  

  const changeMonth = (increment) => {
    const newMonth = currentDate.clone().add(increment, 'month');
    if (newMonth.isBefore(moment(), 'month')) return;
    setCurrentDate(newMonth);
  };
  const renderDay = ({ item: day }) => {
    if (!day) return <View style={styles.emptyDay} />;
    
    const dayNumber = day.format("D");
    const reservation = getReservation(day);
    
    // Initialize text styles and background color
    let textStyles = [styles.dayText];
    let dayBackgroundColor = null;
    
    const isActive = isSelected(day);
    
    if (isActive) {
      dayBackgroundColor = "#4D4FFF";
      textStyles = [styles.dayText, styles.selectedText];
    } else {
      if (isPast(day)) {
        textStyles.push(styles.pastDay);
      } else if (reservation) {
        // Only style accepted/DayOff; pending days get a pending style but remain selectable.
        if (reservation.status === "accepted" || reservation.status === "DayOff") {
          textStyles.push(reservation.isMine ? styles.myReservation : styles.bookedDay);
        } else if (reservation.status === "pending") {
          textStyles.push(styles.pendingDay);
        }
      }
    }
    
    // Disable the day only if it's in the past or it's booked (accepted or DayOff)
    const disabled = isPast(day) || (reservation && (reservation.status === "accepted" || reservation.status === "DayOff"));
    
    return (
      <TouchableOpacity
        style={[
          styles.dayCell,
          isActive && styles.selectedDay,
          { backgroundColor: dayBackgroundColor }
        ]}
        onPress={() => handleDayPress(day)}
        disabled={disabled}
      >
        <Text style={textStyles}>{dayNumber}</Text>
      </TouchableOpacity>
    );
  };
    const isEidPeriodIncomplete = (start, end) => {
    const eidStart = moment().month(5).date(6); // 6 يونيو
    const eidEnd = moment().month(5).date(9);   // 9 يونيو
    
    // إذا كانت الفترة المحددة لا تتداخل مع العيد
    if (end.isBefore(eidStart)) return false;
    if (start.isAfter(eidEnd)) return false;
    
    // تحقق إذا كانت تشمل كل أيام العيد
    const coversFullEid = 
      start.isSameOrBefore(eidStart) && 
      end.isSameOrAfter(eidEnd);
    
    return !coversFullEid;
 };
 return (
    <GestureRecognizer
      onSwipeLeft={() => changeMonth(1)}
      onSwipeRight={() => changeMonth(-1)}
      config={{
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80,
      }}
      style={{ flex: 1 }}
    >
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={close} style={styles.close} />
        </TouchableOpacity>

        <View style={styles.header}>
          {currentDate.isSame(moment(), 'month') ? (
            <View style={{ width: 20 }} />
          ) : (
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <Text style={styles.navButton}>‹</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.monthTitle}>
            {arabicMonths[currentDate.month()]} {currentDate.format('YYYY')}
          </Text>

          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Text style={styles.navButton}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.CalendarHeader}>
          <View style={styles.daysHeader}>
            {['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'].map((day) => (
              <Text key={day} style={styles.dayHeader}>{day}</Text>
            ))}
          </View>

          <FlatList
            data={generateMonth()}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item: week }) => (
              <View style={styles.weekRow}>
                {week.map((day, index) => renderDay({ item: day, index }))}
              </View>
            )}
          />
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>كيفية استخدام روزنامة الحجز</Text>
          <Text style={styles.instruction}>• اختر الفترة المتصلة التي تريدها</Text>
          <Text style={styles.instruction}>• حدد اليوم الأول واليوم الأخير</Text>
          <Text style={styles.instruction}>• اضغط حفظ لتأكيد المدة</Text>
          <Text style={styles.instruction}>• الأيام المشطوبة محجوزة مسبقاً</Text>
          <Text style={styles.instruction}>
            • ملاحظة: اذا كنت تريد حجز يوم واحد فقط اضغط مرتين على تاريخ هذا اليوم
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, (!selectedRange.start || !selectedRange.end) && styles.disabledButton]}
        onPress={() => {
          if (selectedRange.start && selectedRange.end) {
            // التحقق من حجز العيد
            if (isEidPeriodIncomplete(selectedRange.start, selectedRange.end.clone().add(1, 'day'))) {
              Alert.alert(
                "خطأ",
                "لا يمكنك حجز جزء من العيد، يجب حجز الفترة كاملة (من 6 الى 9 حزيران)"
              );
              return;
            }
            
            navigation.navigate('HajesAqar', { 
              id, 
              startDate: selectedRange.start.format('YYYY-MM-DD'), 
              endDate: selectedRange.end.format('YYYY-MM-DD')
            });
          }
        }}
        disabled={!selectedRange.start || !selectedRange.end}
      >
        <Text style={styles.saveText}>حفظ</Text>
      </TouchableOpacity>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Text style={[styles.legendText, styles.bookedDay]}>أيام محجوزة</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={[styles.legendText, styles.pastDay]}>أيام سابقة</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={[styles.legendText, styles.pendingDay]}>أيام بانتظار التأكيد</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={[styles.legendText, styles.myReservation]}>حجزك الخاص</Text>
        </View>
      </View>
    </View>
 </GestureRecognizer>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  close: {
    width: 20,
    height: 20,
    marginBottom: 10,
    marginLeft: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navButton: {
    fontSize: 30,
    paddingHorizontal: 20,
    color: '#4D4FFF',
  },
  monthTitle: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'NotoKufiArabic-Bold',
  },
  CalendarHeader: {
    padding: 5,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 10,
  },
  dayHeader: {
    fontWeight: '600',
    color: '#666',
    width: 40,
    textAlign: 'center',
    fontSize: 9,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 5,
  },
  dayCell: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  emptyDay: {
    width: 45,
    height: 45,
  },
  dayText: {
    color: '#333',
    fontSize: 15,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  selectedDay: {
    backgroundColor: '#4D4FFF',
  },
  selectedText: {
    color: '#fff',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  pastDay: {
    color: 'red',
    textDecorationLine: 'line-through',
  },
  bookedDay: {
    color: 'red',
    textDecorationLine: 'line-through',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  pendingDay: {
    color: 'gold',
    textDecorationLine: 'line-through',
  },
  myReservation: {
    color: '#4D4FFF',
    textDecorationLine: 'line-through',
  },
  instructions: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  instructionsTitle: {
    fontSize: 16,
    marginBottom: 0,
    color: '#444',
    textAlign: 'right',
    fontFamily: 'NotoKufiArabic-Bold',
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  saveButton: {
    backgroundColor: '#4D4FFF',
    paddingHorizontal: 12,
    paddingVertical: 0,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
   
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 20,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NotoKufiArabic-Regular',
  },
});

export default Calendar;