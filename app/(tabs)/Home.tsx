import Colors from '@/shared/Colors';
import { useNavigation } from 'expo-router';
import LottieView from 'lottie-react-native';
import { Settings } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <View style={[styles.headerTitleContainer, Platform.OS === 'ios' && { marginBottom: 10, paddingLeft: 10 }]}>
                    <Text style={styles.headerTitle}>AI Pocket Agent</Text>
                </View>
            ),
            headerTitleAlign: 'center',
            headerLeft: () => (
                <TouchableOpacity
                    onPress={() => { }}
                    style={[styles.leftContainer, Platform.OS === 'ios' && { marginBottom: 10 }]}
                >
                    <LottieView
                        source={require('../../assets/images/Pro_Icon.json')}
                        autoPlay
                        loop
                        style={styles.animation}
                    />
                    <Text style={styles.proText}>Pro</Text>
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity style={[styles.rightContainer, Platform.OS === 'ios' && { marginBottom: 10 }]} onPress={() => { }}>
                    <Settings size={24} />
                </TouchableOpacity>
            ),
        });
    }, []);

    return (
        <View style={styles.container}>
            <Text>Home</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
        backgroundColor: Colors.PRIMARY,
        gap: 2,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    animation: {
        width: Dimensions.get('screen').width * 0.08,
        height: Dimensions.get('screen').width * 0.08,
    },
    proText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.WHITE,
    },
    rightContainer: {
        marginRight: 15,

    },
});
