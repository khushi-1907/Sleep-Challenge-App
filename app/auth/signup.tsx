import { useRouter } from 'expo-router';
import { BedDouble } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

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
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mt-20 mb-12">
          <View className="bg-gradient-to-br from-green-50 to-green-100 w-24 h-24 rounded-3xl items-center justify-center mb-6" style={{
            ...Platform.select({
              web: { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
              default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 8 }
            })
          }}>
            <BedDouble size={32} strokeWidth={1.8} color="#0D161B" />
          </View>
          <Text className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Manrope_800ExtraBold' }}>
            Create Account
          </Text>
          <Text className="text-slate-500 text-lg" style={{ fontFamily: 'Manrope_500Medium' }}>
            Start your sleep tracking journey today
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-slate-700 font-medium mb-2" style={{ fontFamily: 'Manrope_600SemiBold' }}>
              Email
            </Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View>
            <Text className="text-slate-700 font-medium mb-2" style={{ fontFamily: 'Manrope_600SemiBold' }}>
              Password
            </Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900"
              placeholder="Enter your password (min 6 chars)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View>
            <Text className="text-slate-700 font-medium mb-2" style={{ fontFamily: 'Manrope_600SemiBold' }}>
              Confirm Password
            </Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900"
              placeholder="Confirm your password"
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
          className={`mt-8 rounded-xl py-4 ${loading ? 'bg-slate-300' : 'bg-gradient-to-r from-green-500 to-green-600'}`}
          style={{
            ...Platform.select({
              web: { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
              default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 8 }
            })
          }}
        >
          <Text className="text-white font-bold text-center text-lg" style={{ fontFamily: 'Manrope_700Bold' }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-slate-500" style={{ fontFamily: 'Manrope_500Medium' }}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text className="text-blue-600 font-bold" style={{ fontFamily: 'Manrope_700Bold' }}>
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
