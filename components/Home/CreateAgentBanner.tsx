import Colors from '@/shared/Colors';
import React from 'react';
import { Image, View } from 'react-native';

export default function CreateAgentBanner() {
    return (
        <View style={{ backgroundColor: Colors.PRIMARY }}>
            <Image source={require('../../assets/images/agentGroup.png')} style={{ width: 200, height: 200, resizeMode: 'contain' }} />
        </View>
    )
}