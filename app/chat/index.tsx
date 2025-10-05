import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const initialMessages = [
    {
        role: 'user',
        text: 'How are you?'
    },
    {
        role: 'assistant',
        text: 'I am fine, thank you! How can I assist you today?'
    }
]

export default function ChatUI() {
    const navigation = useNavigation();
    const { agentName, agentPrompt, agentId, initialText } = useLocalSearchParams();
    const [messages, setMessages] = useState(initialMessages);
    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: agentName,
            headerBackTitle: 'Go Back',
            headerBackTitleStyle: {
                fontSize: 18,
            },
            headerRight: () => (
                <View
                    style={{
                        marginLeft: 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => { console.log('Plus pressed'); }}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: 'rgba(255,255,255,0.2)', // optional glass effect
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Plus size={22} color="#000" />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation]);
    return (
        <View>
            <FlatList
                data={messages}
                renderItem={({ item, index }) => (
                    <View style={[styles.messageContainer, item.role === 'user' ? styles.userMessage : styles.assistantMessage]}>
                        <Text>{item.text}</Text>
                    </View>
                )} />
        </View>
    )
}


const styles = StyleSheet.create({
    messageContainer: {
        maxWidth: '75%',
        marginVertical: 4,
        padding: 10,
        borderRadius: 12
    },
    userMessage: {

    },
    assistantMessage: {

    }

});