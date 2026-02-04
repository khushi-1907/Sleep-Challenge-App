import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useColorScheme } from '../hooks/use-color-scheme';

export default function Index() {
  const { user, loading } = useAuth();

  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/auth/login" />;
}
