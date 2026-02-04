import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function NudgeScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const isDark = colorScheme === 'dark';
    const theme = Colors[colorScheme];

    return (
        <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: theme.background }}>
            <View
                className="rounded-full p-6 mb-6"
                style={{ backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)' }}
            >
                <Ionicons name="notifications-outline" size={48} color="#22c55e" />
            </View>
            <Text className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope_700Bold', color: theme.textPrimary }}>
                Coming Soon
            </Text>
            <Text className="text-center leading-relaxed" style={{ color: theme.textSecondary }}>
                Nudge is currently under development. Get smart reminders, personalized insights, and gentle prompts to improve your sleep habits.
            </Text>
            <View
                className="mt-8 rounded-xl p-4 w-full"
                style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
            >
                <Text className="text-sm text-center" style={{ color: theme.textSecondary }}>
                    Stay tuned for updates! 🚀
                </Text>
            </View>
        </View>
    );
}
