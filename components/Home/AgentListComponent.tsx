import { View, Text, FlatList } from 'react-native'
import React from 'react'
import { Agents } from '@/shared/AgentList'
import AgentCard from './AgentCard'

export default function AgentListComponent() {
    return (
        <View>
            <FlatList
                data={Agents}
                numColumns={2}
                // @ts-ignore
                renderItem={({ item, index }) => item.featured && (
                    <View style={{ flex: 1, padding: 5 }}>

                        <AgentCard agent={item} key={index} />
                    </View>

                )}
            />

        </View>
    )
}