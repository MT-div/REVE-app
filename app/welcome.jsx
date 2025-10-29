import Welcome2 from '@/assets/images/Welcome2.png';
import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const welcome = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Image source={Welcome2} style={styles.welcome} />
            <Text style={styles.welAvar} >RÊVE أهلا بك في</Text>
            <Text style={styles.urwindow}>نافذتك لعالم الراحة في الحجوزات</Text>

            <View style={styles.confcont}>

                <TouchableOpacity style={styles.conf} onPress={() => navigation.navigate('gallary')} >
                    <Text style={styles.confText}>متابعة</Text>
                </TouchableOpacity>
            </View>
        </View>

    );
}

const styles = StyleSheet.create({


    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingTop: 50,
    },
    welcome: {
        flex: 4,
        maxWidth: '99%',
    },
    welAvar: {
        fontSize: 32,
        color: '#000000',
        textAlign: 'center',
        flex: 1,
        fontFamily: 'NotoKufiArabic-Bold',
    },

    urwindow: {
        fontSize: 22,
        color: '#000000',
        textAlign: 'center',
        flex: 1,
        fontFamily: 'NotoKufiArabic-Regular',
    },

    confcont: {
        flex: 1.5,
    },
    conf: {
        width: 240,
        height: 55,
        backgroundColor: '#4D4FFF',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.45)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 50,
        
    },
    confText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontFamily: 'NotoKufiArabic-Regular',
    },



});

export default welcome;
