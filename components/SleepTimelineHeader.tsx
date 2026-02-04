import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Alert, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface SleepTimelineHeaderProps {
    title?: string;
}

export const SleepTimelineHeader: React.FC<SleepTimelineHeaderProps> = ({ title = "Sleep Timeline" }) => {
    const { logout } = useAuth();

    const handleLogout = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await logout();
                        if (!result.success) {
                            Alert.alert('Error', result.error || 'Failed to sign out');
                        }
                    }
                }
            ]
        );
    };

    const HeaderContent = (
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-slate-100 bg-white/80">
            <View className="w-10" />
            <Text className="text-lg font-bold tracking-tight text-[#0d161b]" style={{ fontFamily: 'Manrope_800ExtraBold' }}>
                {title}
            </Text>
            <TouchableOpacity onPress={handleLogout} className="p-2">
                <Ionicons name="log-out-outline" size={24} color="#0d161b" />
            </TouchableOpacity>
        </View>
    );

    if (Platform.OS === 'ios') {
        return (
            <BlurView intensity={80} tint="light" className="sticky top-0 z-50">{HeaderContent}</BlurView>
        );
    }

    return (
        <View className="bg-white/80 sticky top-0 z-50">{HeaderContent}</View>
    );
};
