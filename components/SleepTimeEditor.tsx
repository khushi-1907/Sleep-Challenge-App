import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { BedDouble, Sun, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/theme';
import { DashboardDay } from '../data/dashboardData';
import { useColorScheme } from '../hooks/use-color-scheme';
import { WebTimePicker } from './WebTimePicker';

interface SleepTimeEditorProps {
    visible: boolean;
    day: DashboardDay | null;
    onClose: () => void;
    onSave: (dayId: string, sleepTime: string, wakeTime: string) => void;
}

export const SleepTimeEditor: React.FC<SleepTimeEditorProps> = ({ visible, day, onClose, onSave }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const isDark = colorScheme === 'dark';
    const theme = Colors[colorScheme];

    const [showSleepPicker, setShowSleepPicker] = useState(false);
    const [showWakePicker, setShowWakePicker] = useState(false);
    const [showWebSleepPicker, setShowWebSleepPicker] = useState(false);
    const [showWebWakePicker, setShowWebWakePicker] = useState(false);
    
    const [tempSleepTime, setTempSleepTime] = useState(day?.sleepTime || '22:00');
    const [tempWakeTime, setTempWakeTime] = useState(day?.wakeTime || '06:00');

    // Reset temp values when day changes
    React.useEffect(() => {
        if (day) {
            setTempSleepTime(day.sleepTime);
            setTempWakeTime(day.wakeTime);
        }
    }, [day]);

    const formatTimeDisplay = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getTimePeriod = (timeStr: string) => {
        const [hours] = timeStr.split(':').map(Number);
        return hours >= 12 ? 'PM' : 'AM';
    };

    const handleSleepTimePress = () => {
        const [h, m] = tempSleepTime.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m);

        if (Platform.OS === 'web') {
            setShowWebSleepPicker(true);
        } else {
            setShowSleepPicker(true);
        }
    };

    const handleWakeTimePress = () => {
        const [h, m] = tempWakeTime.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m);

        if (Platform.OS === 'web') {
            setShowWebWakePicker(true);
        } else {
            setShowWakePicker(true);
        }
    };

    const onSleepPickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowSleepPicker(Platform.OS === 'ios');
        if (selectedDate) {
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            setTempSleepTime(`${hours}:${minutes}`);
        }
    };

    const onWakePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowWakePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            setTempWakeTime(`${hours}:${minutes}`);
        }
    };

    const onWebSleepTimeChange = (timeString: string) => {
        setTempSleepTime(timeString);
        setShowWebSleepPicker(false);
    };

    const onWebWakeTimeChange = (timeString: string) => {
        setTempWakeTime(timeString);
        setShowWebWakePicker(false);
    };

    const handleSave = () => {
        if (day) {
            onSave(day.id, tempSleepTime, tempWakeTime);
        }
        onClose();
    };

    const handleClose = () => {
        // Reset to original values
        if (day) {
            setTempSleepTime(day.sleepTime);
            setTempWakeTime(day.wakeTime);
        }
        onClose();
    };

    if (!day) return null;

    return (
        <>
            <Modal
                transparent={true}
                visible={visible}
                animationType="slide"
                onRequestClose={handleClose}
            >
                {/* Dark Overlay */}
                <Pressable 
                    style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }} 
                    onPress={handleClose}
                >
                    {/* Bottom Sheet Container */}
                    <Pressable style={{ flex: 1, justifyContent: 'flex-end' }} onPress={(e) => e.stopPropagation()}>
                        <View 
                            className="bg-white rounded-t-3xl"
                            style={{
                                backgroundColor: theme.card,
                                minHeight: 400,
                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                ...Platform.select({
                                    web: { boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)' },
                                    default: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 12 }
                                })
                            }}
                        >
                            {/* Handle Bar */}
                            <View className="self-center w-12 h-1 bg-gray-300 rounded-full mt-3 mb-6" style={{ backgroundColor: theme.textSecondary }} />
                            
                            {/* Header */}
                            <View className="flex-row items-center justify-between px-6 pb-6">
                                <TouchableOpacity onPress={handleClose} className="p-2">
                                    <X size={24} color={theme.textSecondary} />
                                </TouchableOpacity>
                                <Text 
                                    className="text-lg font-bold"
                                    style={{ fontFamily: 'Manrope_700Bold', color: theme.textPrimary }}
                                >
                                    Edit Sleep Log
                                </Text>
                                <TouchableOpacity onPress={handleSave} className="p-2">
                                    <Text 
                                        className="text-base font-bold"
                                        style={{ fontFamily: 'Manrope_700Bold', color: theme.primary }}
                                    >
                                        Save
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Time Cards */}
                            <View className="px-6 pb-8 space-y-4">
                                {/* Bedtime Card */}
                                <View 
                                    className="rounded-2xl p-6 border"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                                        borderColor: theme.border
                                    }}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center gap-4">
                                            <View 
                                                className="p-3 rounded-xl"
                                                style={{
                                                    backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.05)'
                                                }}
                                            >
                                                <BedDouble size={24} color={theme.primary} />
                                            </View>
                                            <View>
                                                <Text 
                                                    className="text-sm font-medium mb-1"
                                                    style={{ fontFamily: 'Manrope_500Medium', color: theme.textSecondary }}
                                                >
                                                    Bedtime
                                                </Text>
                                                <Text 
                                                    className="text-3xl font-bold"
                                                    style={{ fontFamily: 'Manrope_800ExtraBold', color: theme.textPrimary }}
                                                >
                                                    {formatTimeDisplay(tempSleepTime)}
                                                </Text>
                                                <Text 
                                                    className="text-sm font-medium mt-1"
                                                    style={{ fontFamily: 'Manrope_500Medium', color: theme.textSecondary }}
                                                >
                                                    {getTimePeriod(tempSleepTime)}
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity 
                                            onPress={handleSleepTimePress}
                                            className="px-4 py-2 rounded-xl border"
                                            style={{
                                                backgroundColor: isDark ? 'rgba(0, 229, 255, 0.1)' : 'rgba(0, 229, 255, 0.05)',
                                                borderColor: isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(0, 229, 255, 0.1)'
                                            }}
                                        >
                                            <Text 
                                                className="text-sm font-bold"
                                                style={{ fontFamily: 'Manrope_700Bold', color: theme.primary }}
                                            >
                                                Adjust
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Wake-up Card */}
                                <View 
                                    className="rounded-2xl p-6 border"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                                        borderColor: theme.border
                                    }}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center gap-4">
                                            <View 
                                                className="p-3 rounded-xl"
                                                style={{
                                                    backgroundColor: isDark ? 'rgba(255, 140, 0, 0.1)' : 'rgba(255, 140, 0, 0.05)'
                                                }}
                                            >
                                                <Sun size={24} color={theme.accent} />
                                            </View>
                                            <View>
                                                <Text 
                                                    className="text-sm font-medium mb-1"
                                                    style={{ fontFamily: 'Manrope_500Medium', color: theme.textSecondary }}
                                                >
                                                    Wake Up
                                                </Text>
                                                <Text 
                                                    className="text-3xl font-bold"
                                                    style={{ fontFamily: 'Manrope_800ExtraBold', color: theme.textPrimary }}
                                                >
                                                    {formatTimeDisplay(tempWakeTime)}
                                                </Text>
                                                <Text 
                                                    className="text-sm font-medium mt-1"
                                                    style={{ fontFamily: 'Manrope_500Medium', color: theme.textSecondary }}
                                                >
                                                    {getTimePeriod(tempWakeTime)}
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity 
                                            onPress={handleWakeTimePress}
                                            className="px-4 py-2 rounded-xl border"
                                            style={{
                                                backgroundColor: isDark ? 'rgba(255, 140, 0, 0.1)' : 'rgba(255, 140, 0, 0.05)',
                                                borderColor: isDark ? 'rgba(255, 140, 0, 0.2)' : 'rgba(255, 140, 0, 0.1)'
                                            }}
                                        >
                                            <Text 
                                                className="text-sm font-bold"
                                                style={{ fontFamily: 'Manrope_700Bold', color: theme.accent }}
                                            >
                                                Adjust
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Native Time Pickers */}
            {showSleepPicker && Platform.OS !== 'web' && (
                <DateTimePicker
                    value={(() => {
                        const date = new Date();
                        const [h, m] = tempSleepTime.split(':').map(Number);
                        date.setHours(h, m);
                        return date;
                    })()}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onSleepPickerChange}
                />
            )}

            {showWakePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                    value={(() => {
                        const date = new Date();
                        const [h, m] = tempWakeTime.split(':').map(Number);
                        date.setHours(h, m);
                        return date;
                    })()}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onWakePickerChange}
                />
            )}

            {/* Web Time Pickers */}
            <WebTimePicker
                visible={showWebSleepPicker}
                value={(() => {
                    const date = new Date();
                    const [h, m] = tempSleepTime.split(':').map(Number);
                    date.setHours(h, m);
                    return date;
                })()}
                onChange={onWebSleepTimeChange}
                onClose={() => setShowWebSleepPicker(false)}
            />

            <WebTimePicker
                visible={showWebWakePicker}
                value={(() => {
                    const date = new Date();
                    const [h, m] = tempWakeTime.split(':').map(Number);
                    date.setHours(h, m);
                    return date;
                })()}
                onChange={onWebWakeTimeChange}
                onClose={() => setShowWebWakePicker(false)}
            />
        </>
    );
};
