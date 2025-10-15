import { Agents } from '@/shared/AgentList'
import { RelativePathString, useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { FlatList, TouchableOpacity } from 'react-native'
import AgentCard from './AgentCard'
import NonFeaturedAgentCard from './NonFeaturedAgentCard'

type AgentListComponentProps = {
    isFeatured: boolean
}

export default function AgentListComponent({ isFeatured }: AgentListComponentProps) {
    const featuredAgents = useMemo(() => Agents.filter(agent => agent.featured === isFeatured), [isFeatured])
    const router = useRouter();

    return (
        <FlatList
            data={featuredAgents}
            numColumns={2}
            scrollEnabled={false}
            keyExtractor={agent => agent.id.toString()}
            renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => router.push({
                    pathname: '/chat' as RelativePathString,
                    params: {
                        agentName: item?.name,
                        initialText: item?.initialText,
                        agentPrompt: item?.prompt,
                        agentId: item?.id,
                    }
                })} style={{ flex: 1, padding: 5 }}>
                    {item.featured ? <AgentCard agent={item} key={index} /> : <NonFeaturedAgentCard agent={item} key={index} />}
                </TouchableOpacity>
            )}
        />
    )
}


