import Colors from '@/shared/Colors';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CreateAgentBanner() {
    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/images/agentGroup.png')}
                style={styles.image}
            />
            <View style={styles.textContainer}>
                <Text style={styles.heading}>Create your own agent</Text>
                <TouchableOpacity style={styles.subHeading}><Text style={{ color: Colors.PRIMARY, textAlign: 'center', marginTop: 5 }}>Create Now</Text></TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.PRIMARY,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        margin: 5
    },
    image: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
    textContainer: {
        flex: 1,
        padding: 12,
    },
    heading: {
        color: Colors.WHITE,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    subHeading: {
        backgroundColor: Colors.WHITE,
        padding: 7,
        borderRadius: 12
    },
});
