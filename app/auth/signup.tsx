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

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await signup(email, password);
      if (result.success) {
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Signup Failed', result.error || 'An error occurred');
      }
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
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
            Create Account
          </Text>
          <Text className="text-lg" style={{ fontFamily: 'Manrope_500Medium', color: DARK_TEXT_SECONDARY }}>
            Start your sleep tracking journey today
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
              placeholder="Enter your password (min 6 chars)"
              placeholderTextColor={DARK_TEXT_SECONDARY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View>
            <Text className="font-medium mb-2" style={{ fontFamily: 'Manrope_600SemiBold', color: DARK_TEXT_SECONDARY }}>
              Confirm Password
            </Text>
            <TextInput
              className="rounded-xl px-4 py-4"
              style={{ backgroundColor: DARK_CARD, borderColor: DARK_BORDER, borderWidth: 1, color: DARK_TEXT_PRIMARY }}
              placeholder="Confirm your password"
              placeholderTextColor={DARK_TEXT_SECONDARY}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
        </View>

        {/* Signup Button */}
        <TouchableOpacity
          onPress={handleSignup}
          disabled={loading}
          className="mt-8 rounded-xl py-4"
          style={{ backgroundColor: loading ? '#475569' : PRIMARY }}
        >
          <Text className="font-bold text-center text-lg" style={{ fontFamily: 'Manrope_700Bold', color: '#0F172A' }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View className="flex-row justify-center mt-8">
          <Text style={{ fontFamily: 'Manrope_500Medium', color: DARK_TEXT_SECONDARY }}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text className="font-bold" style={{ fontFamily: 'Manrope_700Bold', color: PRIMARY }}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Padding */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
