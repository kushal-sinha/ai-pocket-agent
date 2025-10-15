import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { fireStoreDb } from '@/config/FirebaseConfig'
import { useUser } from '@clerk/clerk-expo'
import { ArrowRight } from 'lucide-react-native'
import Colors from '@/shared/Colors'
import { useRouter } from 'expo-router'

type Agent = {
    agentName: string,
    agentId: string,
    prompt: string,
    emoji: string
}

export default function UserCreatedAgentList() {
    const { user } = useUser();
    const router = useRouter();
    const [agentList, setAgentList] = useState<Agent[]>([]);
    useEffect(() => {
        user && getUserAgents();
    }, [user])
    const getUserAgents = async () => {
        const q = query(collection(fireStoreDb, 'agents'), where("userEmail", '==', user?.primaryEmailAddress?.emailAddress));
        setAgentList([]);
        const querysnapshot = await getDocs(q);
        querysnapshot.forEach((doc) => {
            //@ts-ignore
            setAgentList((prev) => [...prev, {
                ...doc.data(),
                agentId: doc.id
            }])
        })
    }
    return (
        <View style={{ marginTop: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>My Agent/Assistant</Text>
            <FlatList
                data={agentList}
                scrollEnabled={false}
                keyExtractor={(item) => item.agentId}
                renderItem={({ item, index }) => (
                    <TouchableOpacity onPress={() => router.push({
                        pathname: '/chat',
                        params: {
                            agentName: item.agentName,
                            initialText: '',
                            agentPrompt: item.prompt,
                            agentId: item.agentId,
                        },
                    })} style={{ display: 'flex', flexDirection: 'row', padding: 15, borderWidth: 0.5, alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.WHITE, borderRadius: 15, marginTop: 10, borderColor: Colors.GREY }}>
                        <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
                            <Text style={{ fontSize: 25, alignItems: 'center' }}>{item.emoji}</Text>
                            <Text style={{ fontSize: 20, fontWeight: 'semibold' }}>{item.agentName}</Text>
                        </View>
                        <ArrowRight />


                    </TouchableOpacity>
                )} />
        </View>
    )
}
