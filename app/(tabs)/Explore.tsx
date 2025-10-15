import { View, Text } from 'react-native'
import React from 'react'
import CreateAgentBanner from '@/components/Home/CreateAgentBanner'
import AgentListComponent from '@/components/Home/AgentListComponent'
import UserCreatedAgentList from '@/components/Explore/UserCreatedAgentList'

export default function Explore() {
    return (
        <View style={{ padding: 20 }}>
            <CreateAgentBanner />
            <UserCreatedAgentList />
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                Featured Agent
            </Text>
            <AgentListComponent isFeatured={true} />
        </View>
    )
}