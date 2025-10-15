import { Tabs } from 'expo-router'
import React from 'react'
import { GlobeIcon, HistoryIcon, HomeIcon, UserCircle } from 'lucide-react-native'
import Colors from '@/shared/Colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const bottomInset = Math.max(insets.bottom, 8);
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.PRIMARY,
                tabBarInactiveTintColor: Colors.LIGHT_GREY,
                tabBarStyle: {
                    backgroundColor: '#0A1D37',
                    borderTopWidth: 0,
                    elevation: 8,
                    height: 52 + bottomInset,
                    paddingBottom: bottomInset,
                    paddingTop: 6,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                },
                tabBarHideOnKeyboard: true,
                sceneStyle: {
                },
            }}
        >
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
