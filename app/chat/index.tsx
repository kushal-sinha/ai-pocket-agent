import Colors from '@/shared/Colors';
import { AIChatModel } from '@/shared/GlobalApi';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Camera, Copy, Plus, Send } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

interface Message {
    role: string;
    content: string;
}

export default function ChatUI() {
    const navigation = useNavigation();
    const { agentName, agentPrompt, initialText } = useLocalSearchParams();
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
        setInput(initialText as string)
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

    const handleCopy = async (text: string) => {
        try {
            await Clipboard.setStringAsync(text);
            if (Platform.OS === 'android') {
                ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Failed to copy text', error);
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
                        {item.role === 'assistant' && (
                            <TouchableOpacity
                                style={styles.copyButton}
                                onPress={() => handleCopy(item.content)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Copy size={16} color={Colors.PRIMARY} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />

            {isSending && (
                <View style={styles.typingIndicator}>
                    <ActivityIndicator size="small" color={Colors.PRIMARY} />
                    <Text style={styles.typingText}>{agentName} is thinking</Text>
                </View>
            )}

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
        borderBottomRightRadius: 2,
    },
    assistantMessage: {
        backgroundColor: (Colors as any).LIGHT_GREY ?? '#EEEEEE',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 20,
    },
    messageText: {
        fontSize: 16,
    },
    userText: {
        color: Colors.WHITE,
    },
    assistantText: {
        color: Colors.BLACK,
    },
    copyButton: {
        alignSelf: 'flex-end',
        marginTop: 6,
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
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        gap: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(54, 146, 255, 0.12)',
        marginBottom: 6,
    },
    typingText: {
        color: Colors.PRIMARY,
        fontSize: 13,
    },
});
