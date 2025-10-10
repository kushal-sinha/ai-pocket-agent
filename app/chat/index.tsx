import Colors from '@/shared/Colors';
import { AIChatModel } from '@/shared/GlobalApi';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Camera, Copy, Plus, Send, X } from 'lucide-react-native';
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
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image';

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

export default function ChatUI() {
    const navigation = useNavigation();
    const { agentName, agentPrompt, initialText } = useLocalSearchParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [image, setImage] = useState<string | null>(null);


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

        setMessages(updatedConversation);
        setInput('');
        if (imageUrl) setImage(null);

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

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
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
            <View >
                {image && (
                    <View style={{ flexDirection: 'row', marginBottom: 5, alignItems: 'center', gap: 8 }}>
                        <Image source={{ uri: image }} style={{ width: 50, height: 50, borderRadius: 6 }} />
                        <TouchableOpacity onPress={() => setImage(null)}>
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
