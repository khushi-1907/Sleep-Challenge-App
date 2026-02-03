import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { auth } from '../../lib/firebase';

import DateTimePicker from '@react-native-community/datetimepicker';

export default function SignupScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Default to 05:00 AM
    const [wakeTime, setWakeTime] = useState(() => {
        const d = new Date();
        d.setHours(5, 0, 0, 0);
        return d;
    });
    const [showPicker, setShowPicker] = useState(false);

    const handleSignup = async () => {
        // Basic validation
        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // Signup successful - navigate to dashboard
            router.replace('/dashboard');
        } catch (error: any) {
            // Show Firebase error message
            Alert.alert('Signup Failed', error.message || 'An error occurred during signup');
        } finally {
            setLoading(false);
        }
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || wakeTime;
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        setWakeTime(currentDate);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-50"
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                showsVerticalScrollIndicator={false}
                className="px-6 py-12"
            >
                <View className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <View className="mb-8 items-center">
                        <Text className="text-3xl font-bold text-slate-800 mb-2">Create Account</Text>
                        <Text className="text-slate-500 text-base text-center">Join the challenge and wake up early</Text>
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

                        <View>
                            <Text className="text-slate-700 font-medium mb-2 ml-1">Confirm Password</Text>
                            <TextInput
                                className="bg-white border border-slate-200 rounded-xl p-4 text-slate-800 text-base"
                                placeholder="••••••••"
                                placeholderTextColor="#94a3b8"
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>

                        <View>
                            <Text className="text-slate-700 font-medium mb-2 ml-1">Target Wake Time</Text>
                            {Platform.OS === 'android' ? (
                                <>
                                    <Pressable
                                        onPress={() => setShowPicker(true)}
                                        className="bg-white border border-slate-200 rounded-xl p-4 active:bg-slate-50"
                                    >
                                        <Text className="text-slate-800 text-base">{wakeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                    </Pressable>
                                    {showPicker && (
                                        <DateTimePicker
                                            value={wakeTime}
                                            mode="time"
                                            is24Hour={false}
                                            onChange={onTimeChange}
                                        />
                                    )}
                                </>
                            ) : Platform.OS === 'ios' ? (
                                <View className="bg-white border border-slate-200 rounded-xl overflow-hidden self-start">
                                    <DateTimePicker
                                        value={wakeTime}
                                        mode="time"
                                        display="default"
                                        onChange={onTimeChange}
                                        themeVariant="light"
                                    />
                                </View>
                            ) : (
                                // For web or other platforms, fallback to a simple input or just the mock if web is only for review
                                <View className="bg-white border border-slate-200 rounded-xl p-2">
                                    <input
                                        type="time"
                                        style={{ fontSize: 16, padding: 10, border: 'none', outline: 'none', width: '100%' }}
                                        value={wakeTime.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" })}
                                        onChange={(e) => {
                                            const [hours, minutes] = e.target.value.split(':');
                                            const newDate = new Date();
                                            newDate.setHours(parseInt(hours), parseInt(minutes));
                                            setWakeTime(newDate);
                                        }}
                                    />
                                </View>
                            )}
                        </View>

                        <Pressable 
                            className="bg-blue-600 rounded-xl py-4 mt-4 active:opacity-90"
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                            ) : (
                                <Text className="text-white text-center font-bold text-lg">Create Account</Text>
                            )}
                        </Pressable>
                    </View>

                    <View className="mt-8 flex-row justify-center">
                        <Text className="text-slate-500">Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <Pressable>
                                <Text className="text-blue-600 font-bold">Login</Text>
                            </Pressable>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
