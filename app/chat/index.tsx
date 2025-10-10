import Colors from '@/shared/Colors';
import { AIChatModel } from '@/shared/GlobalApi';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Camera, Plus, Send } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Message {
    role: string;
    content: string;
}

export default function ChatUI() {
    const navigation = useNavigation();
    const { agentName, agentPrompt } = useLocalSearchParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);

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
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Plus size={22} color="#000" />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [agentName, navigation]);

    useEffect(() => {
        if (agentPrompt) {
            setMessages([{ role: 'system', content: String(agentPrompt) }]);
        }
    }, [agentPrompt]);

    const onSendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || isSending) return;

        const userMessage: Message = { role: 'user', content: trimmed };
        const updatedConversation = [...messages, userMessage];

        setMessages(updatedConversation);
        setInput('');
        setIsSending(true);

        try {
            const result = await AIChatModel(updatedConversation);
            const aiResponse =
                typeof result?.aiResponse === 'string'
                    ? { role: 'assistant', content: result.aiResponse }
                    : result?.aiResponse;

            if (aiResponse?.content) {
                setMessages(prev => [...prev, aiResponse]);
            }
        } catch (error) {
            console.error('Failed to send message', error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <KeyboardAvoidingView
            keyboardVerticalOffset={100}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[{ padding: 10, flex: 1, marginBottom: Platform.OS === 'ios' ? 20 : 0 }]}
        >
            <FlatList
                data={messages.filter(message => message.role !== 'system')}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.messageContainer,
                            item.role === 'user' ? styles.userMessage : styles.assistantMessage,
                        ]}
                    >
                        <Text
                            style={[
                                styles.messageText,
                                item.role === 'user' ? styles.userText : styles.assistantText,
                            ]}
                        >
                            {item.content}
                        </Text>
                    </View>
                )}
            />

            <View style={styles.inputContainer}>
                <TouchableOpacity style={{ marginRight: 10, marginTop: 3 }} disabled={isSending}>
                    <Camera size={27} />
                </TouchableOpacity>
                <TextInput
                    onChangeText={setInput}
                    style={styles.input}
                    placeholder="Type a message ..."
                    value={input}
                    editable={!isSending}
                    returnKeyType="send"
                    onSubmitEditing={onSendMessage}
                />
                <TouchableOpacity
                    onPress={onSendMessage}
                    style={{ padding: 7, backgroundColor: Colors.PRIMARY, borderRadius: 99 }}
                    disabled={isSending}
                >
                    <Send color={Colors.WHITE} size={20} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
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
        paddingHorizontal: 15,
    },
});
