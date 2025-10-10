import { View, Text, TouchableOpacity, TextInput, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Navigator, useNavigation } from 'expo-router';
import Colors from '@/shared/Colors';
import EmojiPicker, { tr } from 'rn-emoji-keyboard'
import { HeaderBackground } from '@react-navigation/elements';


export default function CreateAgent() {
    const navigation = useNavigation();
    const [emoji, setEmoji] = useState('😎');
    const [isOpen, setIsOpen] = React.useState<boolean>(false)
    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: 'Create Agent',
            headerBackTitle: 'Go Back',
            headerBackTitleStyle: {
                fontSize: 18,
            },
            HeaderBackground: Colors.WHITE

        });
    }, []);
    return (
        <KeyboardAvoidingView style={{ padding: 20 }}
            keyboardVerticalOffset={100}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity onPress={() => setIsOpen(true)} style={{ padding: 15, borderWidth: 1, borderRadius: 15, borderColor: Colors.LIGHT_GREY, backgroundColor: Colors.WHITE }}>
                    <Text style={{ fontSize: 30 }}>
                        {emoji}
                    </Text>
                </TouchableOpacity>
                <EmojiPicker onEmojiSelected={(event) => setEmoji(event.emoji)} open={isOpen} onClose={() => setIsOpen(false)} />
            </View>
            <View>
                <Text>Agent / Assitant Name</Text>
                <TextInput placeholderTextColor={Colors.GREY} style={[style.input, { color: Platform.OS === 'ios' ? Colors.BLACK : 'black' }]} placeholder='agent name' />
            </View>
            <View style={{ paddingTop: 15 }}>
                <Text>Instructions</Text>
                <TextInput multiline={true} placeholderTextColor={Colors.GREY} style={[style.input, { color: Platform.OS === 'ios' ? Colors.BLACK : 'black', height: 200, textAlignVertical: 'top' }]} placeholder='agent name' />
            </View>

            <TouchableOpacity style={{ padding: 15, backgroundColor: Colors.PRIMARY, marginTop: 20, borderRadius: 15 }}>
                <Text>Create Agent</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    )
}

const style = StyleSheet.create({
    input: {
        backgroundColor: Colors.WHITE,
        padding: 15,
        borderRadius: 10,
        fontSize: 18,
        marginTop: 5,
        paddingTop: 15,
        paddingBottom: 15
    }
})