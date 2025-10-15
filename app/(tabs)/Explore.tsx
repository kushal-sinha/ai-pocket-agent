import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import CreateAgentBanner from '@/components/Home/CreateAgentBanner'
import AgentListComponent from '@/components/Home/AgentListComponent'
import UserCreatedAgentList from '@/components/Explore/UserCreatedAgentList'

export default function Explore() {
    return (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
            <CreateAgentBanner />
            <UserCreatedAgentList />
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                Featured Agent
            </Text>
            <AgentListComponent isFeatured={true} />
        </ScrollView>
    )
}
