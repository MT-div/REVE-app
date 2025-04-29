import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HajesAqar = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome to HajesAqar!</Text>
            <Text style={styles.subText}>
                This is where you can build the functionality for the "Hajes Aqar" screen.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4D4FFF',
    },
    subText: {
        fontSize: 16,
        color: '#555555',
        marginTop: 10,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});

export default HajesAqar;
