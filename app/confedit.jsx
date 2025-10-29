import conficon from '@/assets/images/conficon.png';
import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const confedit = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Image source={conficon} style={styles.welcome} />
            <Text style={styles.welAvar} >
                تم تعديل معلوماتك بنجاح 
                
                </Text>
            <Text style={styles.urwindow}>
                
                شكرا لثقتك في RÊVE
                نافذتك لعالم الراحة في الحجوزات

            </Text>

            <View style={styles.confcont}>
                <TouchableOpacity style={styles.conf} onPress={() => navigation.navigate('profile')}>
                    <Text style={styles.confText}>موافق</Text>
                </TouchableOpacity>
            </View>
        </View>

    );
}

const styles = StyleSheet.create({


    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#fff',
        height: '100%',
        width: '100%',
        paddingTop: 50,
    },
    welcome: {
        flex: 2,

        maxWidth: '99%',
        fontFamily: 'NotoKufiArabic-Regular',
    },
    welAvar: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontStyle: 'normal',
        fontWeight: '900',
        fontSize: 40,
        color: '#000000',
        textAlign: 'center',
        textAlign: 'center',
        flex: 1,
        fontFamily: 'NotoKufiArabic-Regular',
    },

    urwindow: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontStyle: 'normal',
        fontWeight: '500',
        fontSize: 25,
        color: '#000000',
        height: 100,
        textAlign: 'center',
        letterSpacing: 1,
        flex: 1,
        fontFamily: 'NotoKufiArabic-Regular',
    },

    confcont: {

        flex: 1.5,
        fontFamily: 'NotoKufiArabic-Regular',
    },
    conf: {
        width: 241,
        height: 54,
        backgroundColor: '#4D4FFF',
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(0, 0, 0, 2)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 50,
        elevation: 10,
        fontFamily: 'NotoKufiArabic-Regular',

    },
    confText: {
        fontStyle: 'normal',
        fontWeight: '800',
        fontSize: 18,
        color: '#FFFFFF',
        fontFamily: 'NotoKufiArabic-Regular',
    },



});

export default confedit;
