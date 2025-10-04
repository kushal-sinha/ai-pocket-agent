import { Tabs } from 'expo-router'
import React from 'react'
import { HomeIcon } from 'lucide-react-native'

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="Home" options={{
                tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />
            }} />
            <Tabs.Screen name="Profile" />
            <Tabs.Screen name="Explore" />
            <Tabs.Screen name="History" />

        </Tabs>
    )
}