import { BarChart3 } from 'lucide-react-native';
import { Text, View } from 'react-native';

export default function AnalyticsScreen() {
    return (
        <View className="flex-1 bg-white items-center justify-center px-8">
            <View className="bg-purple-50 rounded-full p-6 mb-6">
                <BarChart3 size={48} strokeWidth={1.8} color="#9333ea" />
            </View>
            <Text className="text-2xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'Manrope_700Bold' }}>
                Coming Soon
            </Text>
            <Text className="text-slate-500 text-center leading-relaxed">
                Analytics is currently under development. Join challenges, compete with friends, and earn rewards for your sleep achievements.
            </Text>
            <View className="mt-8 bg-slate-50 rounded-xl p-4 w-full">
                <Text className="text-sm text-slate-600 text-center">
                    Stay tuned for updates! 🚀
                </Text>
            </View>
        </View>
    );
}
