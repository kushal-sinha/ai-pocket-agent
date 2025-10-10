import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

type SavedChat = {
    id: string;
    agentName?: string;
    createdAt: string;
    messages: { role: string; content: string }[];
};

const CHAT_STORAGE_KEY = 'CHAT_HISTORY_V1';

export default function History() {
    const router = useRouter();
    const navigation = useNavigation();
    const [items, setItems] = useState<SavedChat[]>([]);

    const load = useCallback(async () => {
        try {
            const raw = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
            const list: SavedChat[] = raw ? JSON.parse(raw) : [];
            const normalized = Array.isArray(list) ? list : [];
            normalized.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setItems(normalized);
        } catch (e) {
            console.error('Failed to load saved chats', e);
            setItems([]);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            load();
            return () => {};
        }, [load])
    );

    const clearAll = async () => {
        Alert.alert('Clear all saved chats?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear',
                style: 'destructive',
                onPress: async () => {
                    await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
                    setItems([]);
                },
            },
        ]);
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                items.length > 0 ? (
                    <TouchableOpacity onPress={clearAll} style={{ paddingHorizontal: 12 }}>
                        <Trash2 size={20} />
                    </TouchableOpacity>
                ) : null,
        });
    }, [navigation, items.length]);

    const openChat = async (chat: SavedChat) => {
        try {
            const agent = chat.agentName ?? 'Chat';
            const sessionKey = `CHAT_SESSION_V1_${String(agent)}`;
            await AsyncStorage.setItem(sessionKey, JSON.stringify({ messages: chat.messages, input: '' }));
            await AsyncStorage.setItem(`${sessionKey}_ID`, chat.id);
            router.push({ pathname: '/chat', params: { agentName: agent } });
        } catch (e) {
            console.error('Failed to open saved chat', e);
        }
    };

    const renderItem = ({ item }: { item: SavedChat }) => {
        const agent = item.agentName ?? 'Chat';
        const dt = new Date(item.createdAt);
        const subtitle = dt.toLocaleString();
        const last = [...item.messages].reverse().find((m) => m.role !== 'system');
        let preview = '';
        if (last) {
            const match = last.content.match(/\[Image\]:\s*(https?:\/\/\S+)/i);
            const text = last.content.replace(/\n?\n?\s*\[Image\]:\s*https?:\/\/\S+/i, '').trim();
            preview = text || (match ? '[Image attached]' : '');
        }
        return (
            <TouchableOpacity
                style={styles.row}
                onPress={() => openChat(item)}
                onLongPress={() => deleteChat(item.id)}
                delayLongPress={400}
            >
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{agent}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                    {!!preview && <Text style={styles.preview} numberOfLines={1}>{preview}</Text>}
                </View>
            </TouchableOpacity>
        );
    };

    const deleteChat = async (id: string) => {
        Alert.alert('Delete this chat?', undefined, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    const raw = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
                    const list: SavedChat[] = raw ? JSON.parse(raw) : [];
                    const next = list.filter((c) => c.id !== id);
                    await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(next));
                    setItems(next);
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            {items.length === 0 ? (
                <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>No saved chats yet</Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(it) => it.id}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 12 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    title: { fontSize: 16, fontWeight: '600' },
    subtitle: { fontSize: 12, color: '#666', marginTop: 2 },
    preview: { fontSize: 12, color: '#888', marginTop: 2 },
    separator: { height: 1, backgroundColor: '#eee' },
    emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#666' },
});
