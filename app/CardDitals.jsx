import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router'; // Import the hook
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Image,
    Linking,
    Platform,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../src/context/AuthContext'; // adjust the import path as needed
import { API_BASE_URL } from './config/config';
const { width } = Dimensions.get('window');

const CardDitals = ({ }) => {

    const { id, from  } = useLocalSearchParams();
    const navigation = useNavigation();
    const [canViewLocation, setCanViewLocation] = useState(false); // Add this state
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showFullReview, setShowFullReview] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const imagesScrollRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [loading, setLoading] = useState(true);
    const [property, setProperty] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isReserved, setIsReserved] = useState(false); // Add this state
    const scaleValue = useRef(new Animated.Value(1)).current;
    const favoriteScale = useRef(new Animated.Value(1)).current;
    const autoScrollInterval = useRef(null);
    const { user } = useAuth();

 


    // تقليب الصور تلقائياً
    if (!id) {
        return (
            <View style={styles.errorContainer}>
                <Text>Error: Property ID not provided</Text>
            </View>
        );
    }
    function getRelativeTime(dateString) {
        const now = new Date();
        const pastDate = new Date(dateString);
        const diffInSeconds = Math.floor((now - pastDate) / 1000);

        // Arabic unit names (feminine form for numbers)
        const units = {
            second: { singular: 'ثانية', plural: 'ثواني' },
            minute: { singular: 'دقيقة', plural: 'دقائق' },
            hour: { singular: 'ساعة', plural: 'ساعات' },
            day: { singular: 'يوم', plural: 'أيام' },
            week: { singular: 'أسبوع', plural: 'أسابيع' },
            month: { singular: 'شهر', plural: 'أشهر' },
            year: { singular: 'عام', plural: 'أعوام' }
        };

        if (diffInSeconds < 5) return 'الآن';
        if (diffInSeconds < 60) return `منذ ${diffInSeconds} ${getArabicUnit(diffInSeconds, units.second)}`;

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `منذ ${diffInMinutes} ${getArabicUnit(diffInMinutes, units.minute)}`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `منذ ${diffInHours} ${getArabicUnit(diffInHours, units.hour)}`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `منذ ${diffInDays} ${getArabicUnit(diffInDays, units.day)}`;

        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) return `منذ ${diffInWeeks} ${getArabicUnit(diffInWeeks, units.week)}`;

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) return `منذ ${diffInMonths} ${getArabicUnit(diffInMonths, units.month)}`;

        const diffInYears = Math.floor(diffInDays / 365);
        return `منذ ${diffInYears} ${getArabicUnit(diffInYears, units.year)}`;
    }

    // Helper function to choose singular/plural form
    function getArabicUnit(number, unit) {
        return number === 1 ? unit.singular :
            number === 2 ? unit.singular + 'ان' :
                number > 2 && number < 11 ? unit.plural :
                    unit.singular;
    }
    useEffect(() => {
        if (!id) return;


        const fetchProperty = async () => {
            try {
                // Add headers if the user exists and has a token:
                const headers = user && user.token ? { Authorization: `Bearer ${user.token}` } : {};
                const response = await fetch(`${API_BASE_URL}/gallery/${id}/`, {
                    headers, // Pass the headers here
                });
                if (!response.ok) throw new Error('Failed to fetch property');
                const data = await response.json();
                setIsReserved(data.is_reserved);
                setCanViewLocation(data.can_view_location); // Add this line

                // Combine main photo with additional images if available
                let images = [];
                if (data.realestate && data.realestate.photo) {
                    images.push(data.realestate.photo);
                }
                if (data.realestate && data.realestate.images && data.realestate.images.length > 0) {
                    images = images.concat(data.realestate.images.map(imgObj => imgObj.image));
                }

                const features = (data.realestate && data.realestate.basics) ? data.realestate.basics : [];
                const additionalInfo = (data.realestate && data.realestate.extras) ? data.realestate.extras : [];
                const allReviews = [
                    ...data.comments.map(c => ({
                        ...c,
                        type: 'review',
                        date: getRelativeTime(c.createAt)
                    })),
                    ...data.secondcomments.map(c => ({
                        ...c,
                        type: 'second_review',
                        date: getRelativeTime(c.createAt)
                    }))
                ].sort((a, b) => new Date(b.createAt) - new Date(a.createAt));
                setProperty({
                    ...data.realestate,
                    images,
                    features,
                    additionalInfo,
                    reviews: allReviews,
                });
                // Set the favorite state using backend info.
                setIsFavorite(data.realestate.is_favorite);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching property:', error);
                setProperty(null);
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id, user]);



    const handleImageScroll = Animated.event(
  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
  {
    useNativeDriver: true, // تغيير هذه القيمة إلى true
    listener: event => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / width);
      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex);
      }
    },
  }
);

    const animatePress = (animationRef) => {
        Animated.sequence([
            Animated.timing(animationRef, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true
            }),
            Animated.spring(animationRef, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true
            })
        ]).start();
    };
    const toggleFavorite = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/toggle-favorite/${id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`,
                },
            });

            const data = await response.json();
         

            // Update local favorite state
            setIsFavorite(data.is_favorite);
            animatePress(favoriteScale);
        } catch (error) {
            console.error('Error toggling favorite in details:', error);
        }
    };
    const handleShare = async () => {
        try {
            animatePress(scaleValue);
            await Share.share({
                message: `تحقق من هذا العقار: ${property.title}\nالسعر: $${property.price_with_benefit}`,
                url: API_BASE_URL + '/properties/' + property.id,
                title: property.title
            });

        } catch (error) {
            Alert.alert('حدث خطأ', 'تعذر مشاركة العقار');
        }
    };

    const handleBook = () => {
        animatePress(scaleValue);
        navigation.navigate('Booking', { propertyId: property.id });
    };

    const renderImageItem = ({ item }) => (
        <Image
            source={{ uri: item }}
            style={styles.propertyImage}
            resizeMode="cover"
        />
    );


   const renderPagination = () => {
    if (!property.images || property.images.length === 0) return null;

    return (
        <View style={styles.paginationContainer}>
            {/* العداد الحالي/الإجمالي */}
            <View style={styles.currentIndexContainer}>
                <Text style={styles.currentIndexText}>
                    {currentImageIndex + 1}/{property.images.length}
                </Text>
            </View>
 
            {/* إجمالي عدد الصور */}
                    <View style={styles.totalImagesContainer}>
                                    <Image
                                        source={require('@/assets/images/camera.png')}
                                        style={styles.camera}
                                    />
            <Text style={styles.totalImagesText}>
                           
                عدد الصور : {property.images.length}
            </Text>
            </View>
        </View>
    );
};


    const renderReviewItem = ({ item }) => (
        <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{item.user.username}</Text>
                <View style={styles.ratingContainer}>
                    {[...Array(5)].map((_, i) => (
                        <Image
                            key={i}
                            source={i < item.rating ?
                                require('@/assets/images/star.png') :
                                require('@/assets/images/star.png')}
                            style={styles.starIcon}
                        />
                    ))}
                </View>
            </View>
            <Text style={styles.reviewText} numberOfLines={showFullReview ? undefined : 3}>
                {item.comment}
            </Text>
            <Text style={styles.reviewDate}>
                {new Date(item.createAt).toLocaleDateString()}
            </Text>
        </View>
    );

    const renderFeatureItem = ({ item }) => (
        <View style={styles.featureItem}>
       
                   <Text style={styles.featureText}>{item.describtion === 'اتساعية الكراج' ? `${item.describtion} : ${property.cars} سيارات` :
                   item.describtion === 'غرف النوم' ? `${item.describtion} : ${property.rooms}` :
                       item.describtion === 'الحمامات' ? `${item.describtion} : ${property.bathrooms}` :
                           item.describtion === 'العدد الاقصى للأشخاص' ? `${item.describtion} : ${property.max_members}` :
                               item.describtion}
                               </Text>
                   <Image
                       source={{ uri: item.photo }}
                       style={styles.featureIcon}
                   />
       
               </View>
    );

    const renderAdditionalInfoItem = ({ item }) => (
        <View style={styles.featureItem}>
            <Text style={styles.featureText}>{item.describtion}</Text>
            <Image
                source={{ uri: item.photo }}
                style={styles.featureIcon}
            />
        </View>
    );


    const handleOpenMap = async () => {
        if (!canViewLocation) {
            Alert.alert('غير مسموح', 'يجب عليك حجز العقار أولاً لرؤية الموقع');
            return;
        } if (property.latitude && property.longitude) {
            const url = `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`;
            try {
                await Linking.openURL(url);
            } catch (error) {
                Alert.alert('حدث خطأ', 'تعذر فتح الخريطة');
            }
        } else {
            Alert.alert('تنبيه', 'معلومات الموقع غير متوفرة');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4D4FFF" />
            </View>
        );
    }

    if (!property) {
        return (
            <View style={styles.errorContainer}>
                <Text>Error loading property details</Text>
            </View>
        );
    }
    return (

        <SafeAreaProvider>
            <StatusBar
                hidden={true}
            />
            <View style={styles.container}>
                {/* منطقة الصور */}
                <View style={styles.imageContainer}>
                    <Animated.FlatList
                        ref={imagesScrollRef}
                        horizontal
                        pagingEnabled
                        data={property.images}
                        renderItem={renderImageItem}
                        keyExtractor={(item, index) => index.toString()}
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleImageScroll}
                        scrollEventThrottle={16}
                    />

                    {renderPagination()}


                    {/* أزرار الأعلى */}
                    <View style={styles.topActions}>
                       <TouchableOpacity
      style={styles.iconButton}
      onPress={() => {
        // إذا كانت معلمة 'from' تساوي 'hajesakar'
        if (from === 'HajesAqar'|| from === 'addComment'|| from === 'Done'||from === 'DoneOwner') {
          navigation.navigate('gallary');
        } else {
          navigation.goBack();
        }
      }}
      activeOpacity={0.7}
    >
      <Image
        source={require('@/assets/images/close2.png')}
        style={styles.actionIcon}
      />
    </TouchableOpacity>


                        <View style={styles.leftActions}>

                            <Animated.View style={{
                                transform: [{ scale: favoriteScale }],
                                borderRadius: 20,
                            }}>
                                <TouchableOpacity
                                    style={[
                                        styles.iconButton,
                                        isFavorite && styles.favoriteButtonActive,
                                    ]}
                                    onPress={toggleFavorite}
                                    activeOpacity={0.7}
                                >
                                    <Image
                                        source={require('@/assets/images/Favorite.png')}
                                        style={[
                                            styles.actionIcon,
                                            { tintColor: isFavorite ? 'red' : '#fff' },
                                            isFavorite && styles.favoriteIconActive,
                                        ]}
                                    />
                                </TouchableOpacity>
                            </Animated.View>


                        </View>
                    </View>

                    {/* مؤشر الصور */}
                    <View style={styles.pagination}>
                        {property.images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.paginationDot,
                                    index === currentImageIndex && styles.activeDot
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* محتوى الصفحة */}
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* العنوان و الموقع */}
                    <View style={styles.header}>
                        <View style={styles.idLocationContainer}>
                            <Text style={styles.locationText}>
                                {property.city}-{property.town}
                            </Text>
                            <View style={styles.idLocationRow}>


                                <Text style={styles.ID}>
                                    ID:{property.id}
                                </Text>
                                <TouchableOpacity
                                    onPress={handleOpenMap}
                                    activeOpacity={0.7}
                                    style={styles.locbtn}
                                >
                                    <Image
                                        source={require('@/assets/images/map.png')}
                                        style={styles.map}
                                    />
                                    <Text style={styles.loctext}>  استكشاف</Text>
                                </TouchableOpacity>
                            </View>





                        </View>
                        <Text style={styles.title}>{property.title}</Text>

                    </View>



                    {/* الميزات */}
                    <Text style={styles.sectionTitle}>المعلومات الاساسية</Text>
                    <FlatList
                        data={property.features}
                        renderItem={renderFeatureItem}
                        keyExtractor={(item, index) => index.toString()}
                        scrollEnabled={false}
                        contentContainerStyle={styles.featuresContainer}
                    />

                    <Text style={styles.sectionTitle}>المعلومات الإضافية</Text>
                    <FlatList
                        data={property.additionalInfo}
                        renderItem={renderAdditionalInfoItem}
                        keyExtractor={(item, index) => index.toString()}
                        scrollEnabled={false}
                        contentContainerStyle={styles.featuresContainer}
                    />

                    {/* الوصف */}
                    <View style={styles.descriptionHolder}>
                        <Text style={styles.sectionTitle}>الوصف</Text>
                        <Text style={styles.descriptionText}>{property.describtion}</Text>
                    </View>

                    {/* التقييمات */}
                    <View style={styles.reviewsHeader}>
                        <View style={styles.reviweTitleHolder}>

                            {/* التقييم العام */}
                            <View style={styles.overallRating}>
                                <View style={styles.ratingBadge}>
                                    <Text style={styles.ratingText}>{parseFloat(property.ratings).toFixed(1)}</Text>
                                </View>
                                <Text style={styles.ratingLabel}>
                                    ({property.reviews ? property.reviews.length : 0} تصويت)
                                </Text>
                            </View>

                            <Text style={styles.sectionTitle}>مراجعات</Text>
                        </View>


                    </View>

                    {/* Reviews Section */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.reviewsContainer}
                    >
                        {property.reviews.map((review) => (
                            <View key={review.id} style={styles.reviewItem}>
                                <View style={styles.reviewHeader}>
                                    <View style={styles.ratingContainer}>
                                        <Image
                                            source={require('@/assets/images/star.png')}
                                            style={styles.starIcon}
                                        />
                                        <Text style={styles.ratingText2}>{review.rating.toFixed(1)}</Text>
                                    </View>
                                    <View style={styles.name_photo}>
                                        <Text style={styles.reviewAuthor}>{review.username}</Text>
                                        <Image
                                            source={require('@/assets/images/MaleUser.png')}
                                            style={styles.Person}
                                        />
                                    </View>


                                </View>
                                <Text
                                    style={styles.reviewText}
                                    numberOfLines={showFullReview ? undefined : 3}
                                >
                                    {review.comment}
                                </Text>
                                {review.comment.length > 50 && (
                                    <TouchableOpacity onPress={() => setShowFullReview(!showFullReview)}>
                                        <Text style={styles.readMoreText}>
                                            {showFullReview ? 'عرض أقل' : 'عرض المزيد'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                <Text style={styles.reviewDate}>{review.date}</Text>
                            </View>
                        ))}
                    </ScrollView>



                    <View style={styles.reviewsContainer1} >
                        <TouchableOpacity
                            style={styles.addCommentBtn}
                            activeOpacity={0.7}
                            onPress={() => {
                                if (!user?.token) {
                                    Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
                                    navigation.navigate('loginpage');
                                    return;
                                }
                                if (!isReserved) {
                                    Alert.alert('غير مسموح', 'يجب عليك حجز العقار أولاً قبل إضافة تعليق');
                                    return;
                                }

                                navigation.navigate('addComment', { id: property.id });
                            }}
                        >
                            <Text style={styles.addCommentText}>أضف تعليق</Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>

                {/* زر الحجز */}
                <View style={[styles.footer]}>
                    <Text style={styles.priceText}>${property.price_with_benefit} / اليوم</Text>
                    <Animated.View style={[{ transform: [{ scale: scaleValue }] }]}>
                        <TouchableOpacity
                            style={styles.bookButton}
                            onPress={() =>
                                navigation.navigate('HajesAqar', { id: property.id })
                            }
                            activeOpacity={0.7}
                        >
                            <Text style={styles.bookButtonText}>احجز الآن</Text>
                        </TouchableOpacity>

                    </Animated.View>
                </View>
            </View>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    imageContainer: {
        height: width * 0.8,
        position: 'relative',
    },
    propertyImage: {
        width: width,
        height: width * 0.8,
        resizeMode: 'cover',
    },
    topActions: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        zIndex: 2,
    },
    leftActions: {
        flexDirection: 'row',
        borderRadius: 20,
        
    },
    iconButton: {
        width: 37,
        height: 37,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.67)',
    },
    actionIcon: {
        width: 20,
        height: 20,
        tintColor: '#fff',
    },

    favoriteIconActive: {
        tintColor: 'red', // لون الأيقونة أحمر عند التفعيل
    },
 
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 80,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        color: '#333',
        flex: 1,
        textAlign: 'right',

        fontFamily: 'NotoKufiArabic-Bold',
    },
    idLocationContainer: {

        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        paddingBottom: 10,
    },
    idLocationRow: {
        width: '100%',

        display: 'flex',
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',

    },
    locationText: {
        marginBottom: 5,
        width: '100%',
        textAlign: 'right',
        fontSize: 18,
        color: '#000',
        fontFamily: 'NotoKufiArabic-Bold', // استبدلها بخطك المفضل
    },
    locbtn: {
        width: 'auto',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#4D4FFF',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 2,
        fontFamily: 'NotoKufiArabic-Regular',
        overflow: 'visible',
        marginLeft: 2,
    },
    loctext: {
        fontSize: 16,
        color: '#fff',
        fontFamily: 'NotoKufiArabic-Regular',
    },
    map: {
        width: 20,
        height: 25,
        tintColor: '#fff',
        marginRight: 10,
        marginLeft: 5,
    },
    ID: {
        fontSize: 15,
        color: '#000',
        fontFamily: 'NotoKufiArabic-Regular',

    },


    priceText: {
        fontSize: 20,
        color: '#fff',
        textAlign: 'left',
        fontFamily: 'NotoKufiArabic-Bold',
    },
    overallRating: {
        flexDirection: 'row',
        alignItems: 'center',
        textAlign: 'left',
        fontFamily: 'NotoKufiArabic-Regular',

    },
    ratingBadge: {
        backgroundColor: '#4D4FFF',
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        fontFamily: 'NotoKufiArabic-Regular',
    },
    ratingText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'NotoKufiArabic-Regular',
    },
    ratingText2: {
        color: '#000',
        fontSize: 16,
        fontFamily: 'NotoKufiArabic-Regular',
    },
    name_photo: {
        flexDirection: 'row',
        alignItems: 'center',
        fontSize: 20,
        fontFamily: 'NotoKufiArabic-Regular',

    },
    ratingLabel: {
        fontSize: 16,
        color: '#666',
        textAlign: 'left',
        fontFamily: 'NotoKufiArabic-Regular',
    },
    reviweTitleHolder: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    sectionTitle: {
        fontSize: 18,
        color: '#333',
        marginBottom: 15,
        textAlign: 'right',
        fontFamily: 'NotoKufiArabic-Bold',
    },
    featuresContainer: {
        marginBottom: 10,
        alignItems: 'flex-end',
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
    },
    featureItem: {
        width: '100%',
        flexDirection: 'row',
        marginBottom: 10,

    },
    featureIcon: {
        width: 24,
        height: 24,
        tintColor: '#4D4FFF',
        marginLeft: 8,
    },
    descriptionHolder: {
        marginBottom: 20,
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
    },
    featureText: {
        fontSize: 15,
        color: '#555',
        marginTop: Platform.OS === 'android' ? -8 : 0,
        fontFamily: 'NotoKufiArabic-Regular',

    },
    descriptionText: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        marginBottom: 25,
        textAlign: 'right',
        fontFamily: 'NotoKufiArabic-Regular',
    },
    reviewsHeader: {
        marginBottom: 25,
    },

    reviewsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,


    },
    reviewsContainer1: {
        marginBottom: 20,
        alignItems: 'center',
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        fontFamily: 'NotoKufiArabic-Regular',

    },
    reviewItem: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        width: 300,
        height: 'auto',
        marginRight: 5,
        fontFamily: 'NotoKufiArabic-Regular',
        borderWidth: 0.5,
        borderColor: '#CCC'
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        fontFamily: 'NotoKufiArabic-Regular',
    },
    reviewAuthor: {
        fontSize: 16,
        color: '#333',
        textAlign: 'right',
        fontFamily: 'NotoKufiArabic-Regular',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        fontFamily: 'NotoKufiArabic-Regular',

    },
    starIcon: {
        tintColor: 'gold',
        width: 35,
        height: 35,
    },
    readMoreText: {
        textAlign: 'right',
        paddingBottom: 2,
        fontFamily: 'NotoKufiArabic-Regular',
    },
    reviewText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        marginBottom: 5,
        textAlign: 'right',
        fontFamily: 'NotoKufiArabic-Regular',
    },
    addCommentText: {
        color: '#fff',
        fontSize: 17,
        textAlign: 'center',
        fontFamily: 'NotoKufiArabic-Regular',

    },
    addCommentBtn: {
        width: 0.5 * width,
        backgroundColor: '#4D4FFF',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 2,
        marginBottom: 30,
        fontFamily: 'NotoKufiArabic-Regular',
    },

    reviewDate: {
        fontSize: 13,
        color: '#999',
        textAlign: 'right',
        fontFamily: 'NotoKufiArabic-Regular',
    },
    footer: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
        backgroundColor: '#4D4FFF',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        fontFamily: 'NotoKufiArabic-Regular',

    },
    bookButton: {
        height: 'auto',
        backgroundColor: '#4D4FFF',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 2,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff'
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'NotoKufiArabic-Regular',
    },



 

 
    Person: {
tintColor:'#4d4fff',
        width: 60,
        height: 60,
    },
 
   
    paginationContainer: {
        position: 'absolute',
        bottom: 15,
        left: 0,
        right: 0,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    currentIndexContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.67)',
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    currentIndexText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'NotoKufiArabic-Bold',
    },
    totalImagesText: {
        alignItems:'center',
       
        color: '#fff',
        fontSize: 14,
        fontFamily: 'NotoKufiArabic-Regular',
       
    },
    totalImagesContainer:{
 display:'flex',
  borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection:'row-reverse',
        alignItems:'center',
        backgroundColor: 'rgba(0, 0, 0, 0.67)',
        alignSelf: 'flex-end',

    }
,
    camera: {
     width:25,
     height:25,
     tintColor:'#fff',
     marginLeft:5,
    },

});

export default CardDitals;