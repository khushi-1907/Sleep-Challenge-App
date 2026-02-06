import { useRouter } from 'expo-router';
import { BedDouble } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const DARK_BG = '#0F172A';
const DARK_CARD = '#1E293B';
const DARK_TEXT_PRIMARY = '#F8FAFC';
const DARK_TEXT_SECONDARY = '#94A3B8';
const DARK_BORDER = '#334155';
const PRIMARY = '#00E5FF';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Login Failed', result.error || 'An error occurred');
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: DARK_BG }}>
      <StatusBar barStyle="light-content" />
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mt-20 mb-12">
          <View className="w-24 h-24 rounded-3xl items-center justify-center mb-6" style={{ backgroundColor: DARK_CARD }}>
            <BedDouble size={32} strokeWidth={1.8} color={PRIMARY} />
          </View>
          <Text className="text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope_800ExtraBold', color: DARK_TEXT_PRIMARY }}>
            Welcome Back
          </Text>
          <Text className="text-lg" style={{ fontFamily: 'Manrope_500Medium', color: DARK_TEXT_SECONDARY }}>
            Sign in to track your sleep journey
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="font-medium mb-2" style={{ fontFamily: 'Manrope_600SemiBold', color: DARK_TEXT_SECONDARY }}>
              Email
            </Text>
            <TextInput
              className="rounded-xl px-4 py-4"
              style={{ backgroundColor: DARK_CARD, borderColor: DARK_BORDER, borderWidth: 1, color: DARK_TEXT_PRIMARY }}
              placeholder="Enter your email"
              placeholderTextColor={DARK_TEXT_SECONDARY}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View>
            <Text className="font-medium mb-2" style={{ fontFamily: 'Manrope_600SemiBold', color: DARK_TEXT_SECONDARY }}>
              Password
            </Text>
            <TextInput
              className="rounded-xl px-4 py-4"
              style={{ backgroundColor: DARK_CARD, borderColor: DARK_BORDER, borderWidth: 1, color: DARK_TEXT_PRIMARY }}
              placeholder="Enter your password"
              placeholderTextColor={DARK_TEXT_SECONDARY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className="mt-8 rounded-xl py-4"
          style={{ backgroundColor: loading ? '#475569' : PRIMARY }}
        ><Text className="font-bold text-center text-lg" style={{ fontFamily: 'Manrope_700Bold', color: '#0F172A' }}>{loading ? 'Signing In...' : 'Sign In'}</Text></TouchableOpacity>

        {/* Sign Up Link */}
        <View className="flex-row justify-center mt-8">
          <Text style={{ fontFamily: 'Manrope_500Medium', color: DARK_TEXT_SECONDARY }}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text className="font-bold" style={{ fontFamily: 'Manrope_700Bold', color: PRIMARY }}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Padding */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
