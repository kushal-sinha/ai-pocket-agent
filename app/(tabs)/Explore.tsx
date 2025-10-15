import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import CreateAgentBanner from '@/components/Home/CreateAgentBanner'
import AgentListComponent from '@/components/Home/AgentListComponent'
import UserCreatedAgentList from '@/components/Explore/UserCreatedAgentList'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Explore() {
    const insets = useSafeAreaInsets();
    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Math.max(16, insets.bottom + 16) }}
                showsVerticalScrollIndicator={false}
            >
                <CreateAgentBanner />
                <UserCreatedAgentList />
                <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'left' }}>
                    Featured Agent
                </Text>
                <AgentListComponent isFeatured={true} />
            </ScrollView>
        </SafeAreaView>
    )
}
