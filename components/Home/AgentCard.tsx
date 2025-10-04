import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Colors from '@/shared/Colors'
import { Image } from 'expo-image'

type AgentCardProps = {
    agent: Agent
}

type Agent = {
    id: number,
    name: string,
    desc: string,
    image: string,
    initialText: string,
    prompt: string,
    type: string,
    feature?: boolean,
}

export default function AgentCard({ agent }: AgentCardProps) {
    return (
        <View style={style.container}>
            <View style={style.textContainer}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{agent.name}</Text>
                <Text numberOfLines={2} style={{ color: Colors.GREY, marginTop: 2 }}>{agent.desc}</Text>
            </View>
            <View style={{ position: 'absolute', bottom: 0, right: 0 }}>
                <Image source={agent.image} style={{ width: 120, height: 120, resizeMode: 'contain' }} />
            </View>
        </View>
    )
}

const style = StyleSheet.create({
    container: {
        backgroundColor: Colors.WHITE,
        borderRadius: 20,
        minHeight: 200,
        overflow: 'hidden',

    },
    textContainer: {
        padding: 7
    }
})