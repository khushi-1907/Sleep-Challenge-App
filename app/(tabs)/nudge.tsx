import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

export default function NudgeScreen() {
    return (
        <View className="flex-1 bg-white items-center justify-center px-8">
            <View className="bg-green-50 rounded-full p-6 mb-6">
                <Ionicons name="notifications-outline" size={48} color="#22c55e" />
            </View>
            <Text className="text-2xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'Manrope_700Bold' }}>
                Coming Soon
            </Text>
            <Text className="text-slate-500 text-center leading-relaxed">
                Nudge is currently under development. Get smart reminders, personalized insights, and gentle prompts to improve your sleep habits.
            </Text>
            <View className="mt-8 bg-slate-50 rounded-xl p-4 w-full">
                <Text className="text-sm text-slate-600 text-center">
                    Stay tuned for updates! 🚀
                </Text>
            </View>
        </View>
    );
}
