import Colors from '@/shared/Colors';
import { AIChatModel } from '@/shared/GlobalApi';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Camera, Copy, Plus, Send, X } from 'lucide-react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
    role: string;
    content: string;
}

const uploadToCloudinary = async (uri: string): Promise<string | null> => {
    try {
        const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            console.warn('Missing Cloudinary config: EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME or EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
            return null;
        }

        const formData = new FormData();
        formData.append('file', {
            // React Native fetch requires this object shape
            // name can be anything; type best-effort
            uri,
            name: 'upload.jpg',
            type: 'image/jpeg',
        } as any);
        formData.append('upload_preset', uploadPreset as string);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            console.error('Cloudinary upload failed with status', res.status);
            return null;
        }
        const data = await res.json();
        return data.secure_url || data.url || null;
    } catch (e) {
        console.error('Cloudinary upload error', e);
        return null;
    }
}

const parseMessageContent = (
    content: string
): { text: string; imageUrl?: string } => {
    if (!content) return { text: '' };
    const match = content.match(/\[Image\]:\s*(https?:\/\/\S+)/i);
    if (match) {
        const imageUrl = match[1];
        const text = content.replace(/\n?\n?\s*\[Image\]:\s*https?:\/\/\S+/i, '').trim();
        return { text, imageUrl };
    }
    return { text: content };
};

export default function ChatUI() {
    const navigation = useNavigation();
    const { agentName, agentPrompt, initialText } = useLocalSearchParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [hydrated, setHydrated] = useState(false);
    const SESSION_KEY = `CHAT_SESSION_V1_${String(agentName ?? 'default')}`;
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const SESSION_ID_KEY = `${SESSION_KEY}_ID`;
    const CHAT_STORAGE_KEY = 'CHAT_HISTORY_V1';


    const plusRef = useRef<(() => void) | undefined>(undefined);

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
                        onPress={() => plusRef.current && plusRef.current()}
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

    // Restore session on mount; otherwise seed with system prompt
    useEffect(() => {
        const restore = async () => {
            try {
                const raw = await AsyncStorage.getItem(SESSION_KEY);
                if (raw) {
                    const data = JSON.parse(raw);
                    if (Array.isArray(data?.messages)) setMessages(data.messages);
                    if (typeof data?.input === 'string') setInput(data.input);
                } else {
                    if (initialText) setInput(String(initialText));
                    if (agentPrompt) setMessages([{ role: 'system', content: String(agentPrompt) }]);
                }
                const savedId = await AsyncStorage.getItem(SESSION_ID_KEY);
                if (savedId) setCurrentChatId(savedId);
            } catch (e) {
                console.error('Failed to restore chat session', e);
            } finally {
                setHydrated(true);
            }
        };
        restore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [SESSION_KEY]);

    // Persist session whenever messages or input change
    useEffect(() => {
        if (!hydrated) return;
        const persist = async () => {
            try {
                await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ messages, input }));
            } catch (e) {
                console.error('Failed to persist chat session', e);
            }
        };
        persist();
    }, [messages, input, hydrated, SESSION_KEY]);

    const onSendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || isSending) return;

        setIsSending(true);

        let imageUrl: string | null = null;
        if (image) {
            imageUrl = await uploadToCloudinary(image);
            if (!imageUrl) {
                if (Platform.OS === 'android') {
                    ToastAndroid.show('Image upload failed', ToastAndroid.SHORT);
                }
                setIsSending(false);
                return;
            }
        }

        const contentWithImage = imageUrl ? `${trimmed}\n\n[Image]: ${imageUrl}` : trimmed;
        const userMessage: Message = { role: 'user', content: contentWithImage };
        const updatedConversation = [...messages, userMessage];
        // Build payload for API: include image as a separate content part when present
        const payloadConversation = imageUrl
            ? updatedConversation.map((m, idx, arr) =>
                idx === arr.length - 1 && m.role === 'user'
                    ? {
                        role: m.role,
                        content: [
                            { type: 'text', text: trimmed },
                            { type: 'image_url', image_url: { url: imageUrl } },
                        ],
                    }
                    : m
            )
            : updatedConversation;

        setMessages(updatedConversation);
        setInput('');
        if (imageUrl) setImage(null);

        // Save or update history for this session
        try {
            const raw = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
            const list: any[] = raw ? JSON.parse(raw) : [];
            let nextList = Array.isArray(list) ? list : [];
            let chatId = currentChatId;
            if (!chatId) {
                chatId = Date.now().toString();
                setCurrentChatId(chatId);
                await AsyncStorage.setItem(SESSION_ID_KEY, chatId);
                const newItem = {
                    id: chatId,
                    agentName: agentName ?? 'Chat',
                    createdAt: new Date().toISOString(),
                    messages: updatedConversation,
                };
                nextList.unshift(newItem);
            } else {
                nextList = nextList.map((c) => (c.id === chatId ? { ...c, messages: updatedConversation } : c));
            }
            await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(nextList));
        } catch (e) {
            console.error('Failed to update chat history', e);
        }

        try {
            const result = await AIChatModel(payloadConversation as any);
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

    const onPressPlus = useCallback(async () => {
        try {
            const nonSystem = messages.filter((m) => m.role !== 'system');
            if (nonSystem.length === 0) {
                await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
                await AsyncStorage.removeItem(SESSION_KEY);
                await AsyncStorage.removeItem(SESSION_ID_KEY);
                if (Platform.OS === 'android') {
                    ToastAndroid.show('Cleared all chats', ToastAndroid.SHORT);
                }
                return;
            }

            const raw = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
            const list = raw ? JSON.parse(raw) : [];
            const exists = currentChatId && Array.isArray(list) && list.some((c: any) => c.id === currentChatId);
            if (!exists) {
                const chatToSave = {
                    id: Date.now().toString(),
                    agentName: agentName ?? 'Chat',
                    createdAt: new Date().toISOString(),
                    messages,
                };
                list.unshift(chatToSave);
                await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(list));
            }

            await AsyncStorage.removeItem(SESSION_KEY);
            await AsyncStorage.removeItem(SESSION_ID_KEY);
            if (Platform.OS === 'android') {
                ToastAndroid.show('Chat saved', ToastAndroid.SHORT);
            }
            setInput('');
            setImage(null);
            // Keep system prompt if present; otherwise empty
            const systemMsg = messages.find((m) => m.role === 'system');
            setMessages(systemMsg ? [systemMsg] : []);
            setCurrentChatId(null);
        } catch (e) {
            console.error('Failed to handle plus press', e);
        }
    }, [CHAT_STORAGE_KEY, SESSION_KEY, SESSION_ID_KEY, currentChatId, messages, agentName]);

    useEffect(() => {
        plusRef.current = onPressPlus;
    }, [onPressPlus]);

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

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 0.5,
        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
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
                renderItem={({ item }) => {
                    const { text: bodyText, imageUrl } = parseMessageContent(item.content);
                    return (
                        <View
                            style={[
                                styles.messageContainer,
                                item.role === 'user' ? styles.userMessage : styles.assistantMessage,
                            ]}
                        >
                            {bodyText?.length > 0 && (
                                <Text
                                    style={[
                                        styles.messageText,
                                        item.role === 'user' ? styles.userText : styles.assistantText,
                                    ]}
                                >
                                    {bodyText}
                                </Text>
                            )}
                            {imageUrl && (
                                <Image
                                    source={{ uri: imageUrl }}
                                    style={{ width: 200, height: 200, borderRadius: 8, marginTop: bodyText ? 8 : 0 }}
                                />
                            )}
                            {item.role === 'assistant' && (
                                <TouchableOpacity
                                    style={styles.copyButton}
                                    onPress={() => handleCopy(bodyText || item.content)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Copy size={16} color={Colors.PRIMARY} />
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                }}
            />

            {isSending && (
                <View style={styles.typingIndicator}>
                    <ActivityIndicator size="small" color={Colors.PRIMARY} />
                    <Text style={styles.typingText}>{agentName} is thinking</Text>
                </View>
            )}
            <View >
                {image && (
                    <View style={{ flexDirection: 'row', marginBottom: 5, alignItems: 'center' }}>
                        <Image source={{ uri: image }} style={{ width: 50, height: 50, borderRadius: 6 }} />
                        <TouchableOpacity onPress={() => setImage(null)} style={{ marginLeft: 8 }}>
                            <X />
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.inputContainer}>
                    <TouchableOpacity onPress={pickImage} style={{ marginRight: 10, marginTop: 3 }} disabled={isSending}>
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
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(54, 146, 255, 0.12)',
        marginBottom: 6,
    },
    typingText: {
        color: Colors.PRIMARY,
        fontSize: 13,
        marginLeft: 8,
    },
});
