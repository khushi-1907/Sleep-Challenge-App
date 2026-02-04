import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Moon, Sun } from 'lucide-react-native';
import React from 'react';
import { Alert, Platform, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SleepTimelineHeaderProps {
    title?: string;
}

export const SleepTimelineHeader: React.FC<SleepTimelineHeaderProps> = ({ title = "Sleep Timeline" }) => {
    const { logout } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const currentTheme = Colors[theme];

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
        <View
            className="px-4 py-3 flex-row items-center justify-between border-b"
            style={{
                backgroundColor: currentTheme.background + 'CC', // 80% opacity
                borderBottomColor: currentTheme.border
            }}
        >
            <View className="flex-row items-center">
                <TouchableOpacity onPress={toggleTheme} className="p-2">
                    {isDark ? (
                        <Sun size={22} color={currentTheme.textPrimary} />
                    ) : (
                        <Moon size={22} color={currentTheme.textPrimary} />
                    )}
                </TouchableOpacity>
            </View>
            <Text
                className="text-lg font-bold tracking-tight"
                style={{
                    fontFamily: 'Manrope_800ExtraBold',
                    color: currentTheme.textPrimary
                }}
            >
                {title}
            </Text>
            <TouchableOpacity onPress={handleLogout} className="p-2">
                <Ionicons name="log-out-outline" size={24} color={currentTheme.textPrimary} />
            </TouchableOpacity>
        </View>
    );

    if (Platform.OS === 'ios') {
        return (
            <BlurView intensity={80} tint={isDark ? "dark" : "light"} className="sticky top-0 z-50">{HeaderContent}</BlurView>
        );
    }

    return (
        <View className="sticky top-0 z-50" style={{ backgroundColor: currentTheme.background }}>{HeaderContent}</View>
    );
};
