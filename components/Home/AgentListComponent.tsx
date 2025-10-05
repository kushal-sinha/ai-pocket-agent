import { Agents } from '@/shared/AgentList'
import React, { useMemo } from 'react'
import { FlatList, View } from 'react-native'
import AgentCard from './AgentCard'
import NonFeaturedAgentCard from './NonFeaturedAgentCard'

type AgentListComponentProps = {
    isFeatured: boolean
}

export default function AgentListComponent({ isFeatured }: AgentListComponentProps) {
    const featuredAgents = useMemo(() => Agents.filter(agent => agent.featured === isFeatured), [isFeatured])

    return (
        <FlatList
            data={featuredAgents}
            numColumns={2}
            keyExtractor={agent => agent.id.toString()}
            renderItem={({ item, index }) => (
                <View style={{ flex: 1, padding: 5 }}>
                    {item.featured ? <AgentCard agent={item} key={index} /> : <NonFeaturedAgentCard agent={item} key={index} />}
                </View>
            )}
        />
    )
}


