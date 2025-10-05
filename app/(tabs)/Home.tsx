import AgentListComponent from '@/components/Home/AgentListComponent';
import CreateAgentBanner from '@/components/Home/CreateAgentBanner';
import Colors from '@/shared/Colors';
import { useNavigation } from 'expo-router';
import LottieView from 'lottie-react-native';
import { Settings } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Dimensions, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <View style={[styles.headerTitleContainer, Platform.OS === 'ios' && { marginBottom: 10, paddingLeft: 20 }]}>
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
        <FlatList
            data={[]}
            renderItem={null}
            ListHeaderComponent={() => (
                <View style={styles.container}>
                    <AgentListComponent isFeatured={true} />
                    <CreateAgentBanner />
                    <AgentListComponent isFeatured={false} />

                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15
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
