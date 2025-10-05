import Colors from '@/shared/Colors';
import LottieView from 'lottie-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Agent } from './AgentCard';

type AgentCardProps = {
    agent: Agent;
};

export default function NonFeaturedAgentCard({ agent }: AgentCardProps) {
    return (
        <View style={style.container}>
            {/* Lottie Animation on Top */}
            <View style={style.imageContainer}>
                <LottieView autoPlay loop source={agent.image} style={style.image} />
            </View>

            {/* Text Below the Image */}
            <View style={style.textContainer}>
                <Text style={style.title}>{agent.name}</Text>
                <Text numberOfLines={2} style={style.description}>
                    {agent.desc}
                </Text>
            </View>
        </View>
    );
}

const style = StyleSheet.create({
    container: {
        backgroundColor: Colors.WHITE,
        borderRadius: 20,
        minHeight: 250,
        overflow: 'hidden',
        alignItems: 'center',
        paddingVertical: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginVertical: 10,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    image: {
        width: 130,
        height: 130,
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.BLACK,
    },
    description: {
        color: Colors.GREY,
        marginTop: 6,
        textAlign: 'center',
    },
});
