
import arrow from '@/assets/images/arrow.png';
import star from '@/assets/images/star.png';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StatusBar,
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

const StarIcon = ({ filled, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Image
      source={
        filled
          ? require('@/assets/images/star.png')
          : require('@/assets/images/starEmpty.png')
      }
      style={styles.starIcon}
    />
  </TouchableOpacity>
);

const addComment = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [commentsList, setCommentsList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);

  const handleSubmit = async () => {
    if (comment.trim() && rating === 0) {
      setErrorMessage('قم بتقييم العقار');
      setErrorVisible(true);
      return;
    }
    if (rating > 0 && !comment.trim()) {
      setErrorMessage('قم بإضافة تعليق');
      setErrorVisible(true);
      return;
    }
    if (!comment.trim() && rating === 0) {
      setErrorMessage('يرجى كتابة التعليق وتحديد التقييم');
      setErrorVisible(true);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/review/${id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ rating: rating, comment: comment })
      });
      if (response.ok) {
        const result = await response.json();
        setErrorMessage('تم إرسال التعليق بنجاح');
        setErrorVisible(true);
        const newComment = {
          id: Date.now().toString(),
          text: comment,
          rating: rating,
          duration: 'حديثاً',
          author: user.username
        };
        setCommentsList([newComment, ...commentsList]);
        setComment('');
        setRating(0);
      } else {
        const errorData = await response.json();
        console.error('Error creating review:', errorData);
        setErrorMessage('فشل في إرسال التعليق');
        setErrorVisible(true);
      }
    } catch (error) {
      console.error('Network error:', error);
      setErrorMessage('حدث خطأ أثناء إرسال التعليق');
      setErrorVisible(true);
    }
  };

  const renderStars = (currentRating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((starIndex) => (
          <StarIcon
            key={starIndex}
            filled={starIndex <= currentRating}
            onPress={() => setRating(starIndex)}
          />
        ))}
      </View>
    );
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <View style={styles.ratingRow}>
        <View style={styles.holder2}>
          <Image
            source={require('@/assets/images/MaleUser.png')}
            style={styles.Person}
          />
          <Text style={styles.author}>{item.author}</Text>
        </View>
        <View style={styles.holder2}>
          <Text style={styles.commentDuration}>{item.duration}</Text>
          <Text style={styles.rate}>{item.rating}</Text>
          <Image source={star} style={styles.star} />
        </View>
      </View>
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
              style="light" // اختر "light" أو "dark" حسب خلفية التطبيق
              hidden={false} // قم بعرض أو إخفاء البار العلوي
              translucent={true} // جعل البار شفافًا إذا أردت
              backgroundColor="#4D4FFF" // لون الخلفية إذا كان غير شفاف
            />
      <ErrorMessageModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
      
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.replace("CardDitalsOwner", { from: 'addCommentOwner',id })}>
          <Image source={arrow} style={styles.arrowIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>إضافة تعليق</Text>
      </View>
      
      <View style={styles.commentHolder}>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={4}
          placeholder="..."
          value={comment}
          onChangeText={setComment}
          textAlignVertical="top"
        />
        <View style={styles.holder}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>إرسال</Text>
          </TouchableOpacity>
          <View style={styles.ratingSection}>
            {renderStars(rating)}
          </View>
        </View>
      </View>
      
      <FlatList
        data={commentsList}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.commentsList}
      />
    </View>
  );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topHolder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  close: {
    width: 20,
    height: 20,
  },
  header: {
    fontSize: 20,
    textAlign: 'right',
    color: '#333',
    fontFamily: 'NotoKufiArabic-Bold',
    flex: 1,
    marginRight: 10,
  },
  headerContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(149, 147, 147, 0.69)',
    paddingBottom: 10,
    paddingTop:30,
paddingRight:10,
backgroundColor: '#4d4fff',
  },
  title: {
    fontSize: 25,
    textAlign: 'right',
    marginTop: -8,
    fontFamily: 'NotoKufiArabic-Bold',

  },
  arrowIcon: {
    width: 40,
    height: 40,
  },
  commentHolder: {
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    padding: 20,
    marginBottom: 20,
    marginRight:20,
    marginLeft:20,
  },
  input: {
    width: '100%',
    height: 'auto',
    borderRadius: 10,
    paddingHorizontal: 15,
    textAlign: 'right',
    fontSize: 16,
    backgroundColor: '#D9D9D9',
    marginBottom: 20,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  holder: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  starIcon: {
    width: 30,
    height: 30,
    
  },
  submitButton: {
    backgroundColor: '#4D4FFF',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'NotoKufiArabic-SemiBold',
  },
  commentContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  ratingRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  holder2: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  Person: {
    tintColor:'#4d4fff',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  rate: {
    color: '#000',
    fontSize: 15,
    fontFamily: 'NotoKufiArabic-Bold',
  },
  commentDuration: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  commentText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    textAlign: 'right',
    fontFamily: 'NotoKufiArabic-Regular',
  },
  author: {
    fontSize: 16,
    fontFamily: 'NotoKufiArabic-Regular',
  },
  star: {
    width: 30,
    height: 30,
    tintColor:'gold'
  },
  commentsList: {
    paddingBottom: 30,
    marginRight:20,
    marginLeft:20,
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
});

export default addComment;