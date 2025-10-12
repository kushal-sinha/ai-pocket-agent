import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    Alert,
} from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/shared/Colors';
import EmojiPicker from 'rn-emoji-keyboard';
import { doc, setDoc } from 'firebase/firestore';
import { fireStoreDb } from '@/config/FirebaseConfig';
import { useUser } from '@clerk/clerk-expo';

export default function CreateAgent() {
    const navigation = useNavigation();
    const [emoji, setEmoji] = useState('😎');
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [agentName, setAgentName] = useState<string>('');
    const [instruction, setInstruction] = useState<string>('');
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: 'Create Agent',
            headerBackTitle: 'Back',
            headerBackTitleStyle: {
                fontSize: 16,
            },
            headerStyle: {
                backgroundColor: Colors.WHITE,
            },
            headerTitleStyle: {
                fontWeight: '600',
            },
        });
    }, []);

    const createNewAgent = async () => {
        if (!agentName || !instruction || !emoji) {
            Alert.alert('Please enter all details before proceeding.');
            return;
        }
        const agentId = Date.now().toString();
        await setDoc(doc(fireStoreDb, 'agents', agentId), {
            emoji,
            agentName,
            agentId,
            prompt: instruction,
            userEmail: user?.primaryEmailAddress?.emailAddress,
        });

        Alert.alert('Success', 'Your Agent has been created!', [
            {
                text: 'Ok',
                style: 'cancel',
            },
            {
                text: 'Try Now',
                onPress: () =>
                    router.push({
                        pathname: '/chat',
                        params: {
                            agentName,
                            initialText: '',
                            agentPrompt: instruction,
                            agentId,
                        },
                    }),
            },
        ]);

        setAgentName('');
        setInstruction('');
    };

    return (
        <LinearGradient
            colors={['#F9FAFB', '#E9ECEF']}
            style={{ flex: 1 }}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.emojiContainer}>
                        <TouchableOpacity
                            onPress={() => setIsOpen(true)}
                            style={styles.emojiButton}
                        >
                            <Text style={{ fontSize: 40 }}>{emoji}</Text>
                        </TouchableOpacity>
                        <EmojiPicker
                            onEmojiSelected={(event) => setEmoji(event.emoji)}
                            open={isOpen}
                            onClose={() => setIsOpen(false)}
                        />
                        <Text style={styles.subtitle}>Choose your Agent’s vibe</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Agent / Assistant Name</Text>
                        <TextInput
                            onChangeText={(v) => setAgentName(v)}
                            value={agentName}
                            placeholder="Ex. StudyMate, CodeBuddy..."
                            placeholderTextColor={Colors.GREY}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Instructions</Text>
                        <TextInput
                            onChangeText={(v) => setInstruction(v)}
                            value={instruction}
                            multiline={true}
                            placeholder="Ex. You are a professional teacher helping students learn math..."
                            placeholderTextColor={Colors.GREY}
                            style={[styles.input, { height: 180, textAlignVertical: 'top' }]}
                        />
                    </View>

                    <TouchableOpacity onPress={createNewAgent} activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#6C63FF', '#5A55FF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Create Agent</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    emojiContainer: {
        alignItems: 'center',
        marginVertical: 25,
    },
    emojiButton: {
        padding: 20,
        borderRadius: 20,
        backgroundColor: Colors.WHITE,
        borderWidth: 0.8,
        borderColor: Colors.LIGHT_GREY,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.GREY,
        marginTop: 10,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontWeight: '600',
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.WHITE,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.LIGHT_GREY,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    button: {
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#5A55FF',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    buttonText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
});
