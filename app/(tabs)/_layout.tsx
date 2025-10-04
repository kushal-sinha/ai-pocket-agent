import { Tabs } from 'expo-router'
import React from 'react'
import { GlobeIcon, HistoryIcon, HomeIcon, UserCircle } from 'lucide-react-native'

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="Home" options={{
                tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />
            }} />
            <Tabs.Screen name="Profile" options={{
                tabBarIcon: ({ color, size }) => <GlobeIcon color={color} size={size} />
            }} />
            <Tabs.Screen name="Explore" options={{
                tabBarIcon: ({ color, size }) => <HistoryIcon color={color} size={size} />
            }} />
            <Tabs.Screen name="History" options={{
                tabBarIcon: ({ color, size }) => <UserCircle color={color} size={size} />
            }} />

        </Tabs>
    )
}