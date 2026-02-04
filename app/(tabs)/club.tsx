import { Users } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function ClubScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const isDark = colorScheme === 'dark';
    const theme = Colors[colorScheme];

    return (
        <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: theme.background }}>
            <View
                className="rounded-full p-6 mb-6"
                style={{ backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.05)' }}
            >
                <Users size={48} strokeWidth={1.8} color="#9333ea" />
            </View>
            <Text className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope_700Bold', color: theme.textPrimary }}>
                Coming Soon
            </Text>
            <Text className="text-center leading-relaxed" style={{ color: theme.textSecondary }}>
                Club is currently under development. Join challenges, compete with friends, and earn rewards for your sleep achievements.
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
