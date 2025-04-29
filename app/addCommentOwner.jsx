import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router'; // To get the real estate id (pk) from route params
import { useAuth } from '../src/context/AuthContext'; // Adjust the path as needed
import { API_BASE_URL } from './config'; // Adjust the path as needed
import close from '@/assets/images/close.png';
import star from '@/assets/images/star.png';

// Star icon component remains unchanged.
const StarIcon = ({ filled, onPress }) => (


  <TouchableOpacity onPress={onPress}>
    <Image
      source={
        filled
          ? require('@/assets/images/star.png') // Filled star
          : require('@/assets/images/starEmpty.png') // Empty star
      }
      style={styles.starIcon}
    />
  </TouchableOpacity>
);

const addComment = () => {
  // Grab the property id from the route parameters so we can send it to the review endpoint.
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const { user } = useAuth(); // Contains the token and other user info
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [commentsList, setCommentsList] = useState([

  ]);

  // This function now calls the backend create_review endpoint.
  const handleSubmit = async () => {
     if (comment.trim() && rating === 0) {
          Alert.alert('تنبيه', 'قم يتقييم العقار ');
          return;
        }
        if (rating > 0 && !comment.trim()) {
          Alert.alert('تنبيه', 'قم باضافة تعليق ');
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
        Alert.alert('نجاح', 'تم إرسال التعليق بنجاح');
        // Optionally, update your comments list with the new comment.
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
        Alert.alert('خطأ', 'فشل في إرسال التعليق');
      }
    } catch (error) {
      console.error('Network error:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال التعليق');
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
      {/* Header: Avatar and Author Name */}
      <View style={styles.ratingRow}>
        <View style={styles.holder2}>
          <Image
            source={require('@/assets/images/MaleUser.png')}
            style={styles.Person}
          />
          <Text style={styles.author}>{item.author}</Text>
        </View>
        {/* Rating and duration */}
        <View style={styles.holder2}>
          <Text style={styles.commentDuration}>{item.duration}</Text>
          <Text style={styles.rate}>{item.rating}</Text>
          <Image source={star} style={styles.star} />
        </View>
      </View>
      {/* Comment Text */}
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );


  return (
    <View style={styles.container}>
      <View style={styles.topHolder}>
        <TouchableOpacity onPress={() => navigation.replace("CardDitalsOwner", { id })}>
          <Image source={close} style={styles.close} />
        </TouchableOpacity>
        <Text style={styles.header}>إضافة تعليق</Text>
      </View>
      {/* Comment Input */}
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

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={!comment.trim() || rating === 0}
          >
            <Text style={styles.buttonText}>إرسال</Text>
          </TouchableOpacity>
          {/* Star Rating */}
          <View style={styles.ratingSection}>
            {renderStars(rating)}
          </View>
        </View>
      </View>
      {/* Comments List */}
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
    padding: 20,
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
  commentHolder: {
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    padding: 20,
    marginBottom: 20,
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
  },
  commentsList: {
    paddingBottom: 30,
  },
});

export default addComment;