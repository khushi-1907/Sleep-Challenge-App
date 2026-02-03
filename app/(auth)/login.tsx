import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { auth } from '../../lib/firebase';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        // Basic validation
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Login successful - navigate to dashboard
            router.replace('/dashboard');
        } catch (error: any) {
            // Show Firebase error message
            Alert.alert('Login Failed', error.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-50"
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                showsVerticalScrollIndicator={false}
                className="px-6"
            >
                <View className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <View className="mb-8 items-center">
                        <Text className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</Text>
                        <Text className="text-slate-500 text-base">Sign in to continue your journey</Text>
                    </View>

                    <View className="space-y-4">
                        <View>
                            <Text className="text-slate-700 font-medium mb-2 ml-1">Email</Text>
                            <TextInput
                                className="bg-white border border-slate-200 rounded-xl p-4 text-slate-800 text-base"
                                placeholder="hello@example.com"
                                placeholderTextColor="#94a3b8"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View>
                            <Text className="text-slate-700 font-medium mb-2 ml-1">Password</Text>
                            <TextInput
                                className="bg-white border border-slate-200 rounded-xl p-4 text-slate-800 text-base"
                                placeholder="••••••••"
                                placeholderTextColor="#94a3b8"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <Pressable 
                            className="bg-blue-600 rounded-xl py-4 mt-4 active:opacity-90"
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                            ) : (
                                <Text className="text-white text-center font-bold text-lg">Login</Text>
                            )}
                        </Pressable>
                    </View>

                    <View className="mt-8 flex-row justify-center">
                        <Text className="text-slate-500">Don't have an account? </Text>
                        <Link href="/(auth)/signup" asChild>
                            <Pressable>
                                <Text className="text-blue-600 font-bold">Create an account</Text>
                            </Pressable>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
