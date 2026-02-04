import { useRouter } from 'expo-router';
import { BedDouble } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

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
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mt-20 mb-12">
          <View className="bg-blue-50 w-24 h-24 rounded-3xl items-center justify-center mb-6">
            <BedDouble size={32} strokeWidth={1.8} color="#0D161B" />
          </View>
          <Text className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Manrope_800ExtraBold' }}>
            Welcome Back
          </Text>
          <Text className="text-slate-500 text-lg" style={{ fontFamily: 'Manrope_500Medium' }}>
            Sign in to track your sleep journey
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
              placeholder="Enter your password"
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
          className={`mt-8 rounded-xl py-4 ${loading ? 'bg-slate-300' : 'bg-blue-600'}`}
        ><Text className="text-white font-bold text-center text-lg" style={{ fontFamily: 'Manrope_700Bold' }}>{loading ? 'Signing In...' : 'Sign In'}</Text></TouchableOpacity>

        {/* Sign Up Link */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-slate-500" style={{ fontFamily: 'Manrope_500Medium' }}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text className="text-blue-600 font-bold" style={{ fontFamily: 'Manrope_700Bold' }}>
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
