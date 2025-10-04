import { Agents } from '@/shared/AgentList'
import React, { useMemo } from 'react'
import { FlatList, View } from 'react-native'
import AgentCard from './AgentCard'

export default function AgentListComponent() {
    const featuredAgents = useMemo(() => Agents.filter(agent => agent.featured), [])

    return (
        <FlatList
            data={featuredAgents}
            numColumns={2}
            keyExtractor={agent => agent.id.toString()}
            renderItem={({ item }) => (
                <View style={{ flex: 1, padding: 5 }}>
                    <AgentCard agent={item} />
                </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
        />
    )
}
