import Colors from '@/shared/Colors';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Camera, Plus, Send } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
        <KeyboardAvoidingView keyboardVerticalOffset={100} behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[{ padding: 10, flex: 1, marginBottom: Platform.OS === 'ios' ? 20 : 0 }]}>
            <FlatList
                data={messages}
                renderItem={({ item, index }) => (
                    <View style={[styles.messageContainer, item.role === 'user' ? styles.userMessage : styles.assistantMessage]}>
                        <Text style={[styles.messageText, item.role === 'user' ? styles.userText : styles.assistantText]}>{item.text}</Text>
                    </View>
                )} />

            <View style={styles.inputContainer}>
                <TouchableOpacity style={{ marginRight: 10, marginTop: 3 }}>
                    <Camera size={27} />
                </TouchableOpacity>
                <TextInput style={styles.input} placeholder='Type a message ...' />
                <TouchableOpacity style={{ padding: 7, backgroundColor: Colors.PRIMARY, borderRadius: 99 }}>
                    <Send color={Colors.WHITE} size={20} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}


const styles = StyleSheet.create({
    messageContainer: {
        maxWidth: '75%',
        marginVertical: 10,
        padding: 10,
        borderRadius: 10,
    },
    userMessage: {
        backgroundColor: Colors.PRIMARY,
        alignSelf: 'flex-end',
        borderBottomRightRadius: 2
    },
    assistantMessage: {
        backgroundColor: Colors.LIGHT_GREY,
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 20
    },
    messageText: {
        fontSize: 16,
    },
    userText: {
        color: Colors.WHITE
    },
    assistantText: {
        color: Colors.BLACK
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,

    },
    input: {
        flex: 1,
        padding: 10,
        borderRadius: 20,
        borderColor: '#CCC',
        backgroundColor: Colors.WHITE,
        marginRight: 8,
        paddingHorizontal: 15
    }

});