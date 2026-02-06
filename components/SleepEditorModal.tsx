import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import { BedDouble, Sun, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/theme';
import { DashboardDay } from '../data/dashboardData';
import { useColorScheme } from '../hooks/use-color-scheme';
import { WebTimePicker } from './WebTimePicker';

interface SleepEditorModalProps {
    visible: boolean;
    day: DashboardDay | null;
    onClose: () => void;
    onSave: (dayId: string, sleepTime: string, wakeTime: string) => void;
}

export const SleepEditorModal: React.FC<SleepEditorModalProps> = ({
    visible,
    day,
    onClose,
    onSave,
}) => {
    const colorScheme = useColorScheme() ?? 'light';
    const isDark = colorScheme === 'dark';
    const theme = Colors[colorScheme];

    const [tempSleepTime, setTempSleepTime] = useState<string>('');
    const [tempWakeTime, setTempWakeTime] = useState<string>('');
    const [showSleepPicker, setShowSleepPicker] = useState(false);
    const [showWakePicker, setShowWakePicker] = useState(false);
    const [showWebSleepPicker, setShowWebSleepPicker] = useState(false);
    const [showWebWakePicker, setShowWebWakePicker] = useState(false);

    useEffect(() => {
        if (day) {
            setTempSleepTime(day.sleepTime);
            setTempWakeTime(day.wakeTime);
        }
    }, [day]);

    const formatTimeDisplay = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHours = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${displayHours}:${minutes} ${ampm}`;
    };

    const parseTimeToDate = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    const handleSleepTimeChange = (time: string) => {
        setTempSleepTime(time);
    };

    const handleWakeTimeChange = (time: string) => {
        setTempWakeTime(time);
    };

    const openSleepPicker = () => {
        if (Platform.OS === 'web') {
            setShowWebSleepPicker(true);
        } else {
            setShowSleepPicker(true);
        }
    };

    const openWakePicker = () => {
        if (Platform.OS === 'web') {
            setShowWebWakePicker(true);
        } else {
            setShowWakePicker(true);
        }
    };

    const onSleepPickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const { type } = event;
        // On Android, picker returns 'set' when confirmed, 'dismissed' when cancelled
        if (type === 'set' && selectedDate) {
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            handleSleepTimeChange(`${hours}:${minutes}`);
        }
        // Always hide picker after selection/dismissal on Android
        if (Platform.OS !== 'ios') {
            setShowSleepPicker(false);
        }
    };

    const onWakePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const { type } = event;
        // On Android, picker returns 'set' when confirmed, 'dismissed' when cancelled
        if (type === 'set' && selectedDate) {
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            handleWakeTimeChange(`${hours}:${minutes}`);
        }
        // Always hide picker after selection/dismissal on Android
        if (Platform.OS !== 'ios') {
            setShowWakePicker(false);
        }
    };

    const handleSave = () => {
        if (day) {
            onSave(day.id, tempSleepTime, tempWakeTime);
        }
        onClose();
    };

    const handleClose = () => {
        setTempSleepTime(day?.sleepTime || '');
        setTempWakeTime(day?.wakeTime || '');
        onClose();
    };

    if (!day) return null;

    return (
        <>
            <Modal
                visible={visible}
                transparent={true}
                animationType="slide"
                onRequestClose={handleClose}
            >
                {/* Dark Overlay */}
                <Pressable
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                    onPress={handleClose}
                >
                    {/* Blur Background */}
                    <BlurView
                        intensity={20}
                        tint="dark"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        }}
                    />
                </Pressable>

                {/* Bottom Sheet Content */}
                <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: theme.card,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        paddingTop: 8,
                        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
                        boxShadow: '0px -4px 12px rgba(0,0,0,0.15)',
                    }}
                >
                    {/* Handle Bar */}
                    <View
                        style={{
                            width: 36,
                            height: 4,
                            backgroundColor: isDark ? '#475569' : '#CBD5E1',
                            borderRadius: 2,
                            alignSelf: 'center',
                            marginBottom: 24,
                        }}
                    />

                    {/* Header */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingHorizontal: 24,
                            marginBottom: 32,
                        }}
                    >
                        <TouchableOpacity onPress={handleClose}>
                            <X size={24} color={theme.textSecondary} />
                        </TouchableOpacity>

                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: '700',
                                fontFamily: 'Manrope_700Bold',
                                color: theme.textPrimary,
                            }}
                        >
                            Edit Sleep Log
                        </Text>

                        <TouchableOpacity onPress={handleSave}>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    fontFamily: 'Manrope_600SemiBold',
                                    color: theme.primary,
                                }}
                            >
                                Save
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Time Cards */}
                    <View style={{ paddingHorizontal: 24, gap: 20 }}>
                        {/* Bedtime Card */}
                        <View
                            style={{
                                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.8)',
                                borderRadius: 16,
                                padding: 20,
                                borderWidth: 1,
                                borderColor: theme.border,
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                    <View
                                        style={{
                                            width: 48,
                                            height: 48,
                                            backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                                            borderRadius: 12,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <BedDouble size={24} color={isDark ? '#A78BFA' : '#7C3AED'} />
                                    </View>
                                    <View>
                                        <Text
                                            style={{
                                                fontSize: 14,
                                                fontWeight: '500',
                                                fontFamily: 'Manrope_500Medium',
                                                color: theme.textSecondary,
                                                marginBottom: 4,
                                            }}
                                        >
                                            Bedtime
                                        </Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                                            <Text
                                                style={{
                                                    fontSize: 28,
                                                    fontWeight: '800',
                                                    fontFamily: 'Manrope_800ExtraBold',
                                                    color: theme.textPrimary,
                                                    lineHeight: 32,
                                                }}
                                            >
                                                {formatTimeDisplay(tempSleepTime).split(' ')[0]}
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: '600',
                                                    fontFamily: 'Manrope_600SemiBold',
                                                    color: theme.textSecondary,
                                                }}
                                            >
                                                {formatTimeDisplay(tempSleepTime).split(' ')[1]}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={openSleepPicker}
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                        backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)',
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontWeight: '600',
                                            fontFamily: 'Manrope_600SemiBold',
                                            color: isDark ? '#A78BFA' : '#7C3AED',
                                        }}
                                    >
                                        Adjust
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Wake-up Card */}
                        <View
                            style={{
                                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.8)',
                                borderRadius: 16,
                                padding: 20,
                                borderWidth: 1,
                                borderColor: theme.border,
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                    <View
                                        style={{
                                            width: 48,
                                            height: 48,
                                            backgroundColor: isDark ? 'rgba(251, 146, 60, 0.2)' : 'rgba(251, 146, 60, 0.1)',
                                            borderRadius: 12,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Sun size={24} color={isDark ? '#FB923C' : '#F97316'} />
                                    </View>
                                    <View>
                                        <Text
                                            style={{
                                                fontSize: 14,
                                                fontWeight: '500',
                                                fontFamily: 'Manrope_500Medium',
                                                color: theme.textSecondary,
                                                marginBottom: 4,
                                            }}
                                        >
                                            Wake Up
                                        </Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                                            <Text
                                                style={{
                                                    fontSize: 28,
                                                    fontWeight: '800',
                                                    fontFamily: 'Manrope_800ExtraBold',
                                                    color: theme.textPrimary,
                                                    lineHeight: 32,
                                                }}
                                            >
                                                {formatTimeDisplay(tempWakeTime).split(' ')[0]}
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: '600',
                                                    fontFamily: 'Manrope_600SemiBold',
                                                    color: theme.textSecondary,
                                                }}
                                            >
                                                {formatTimeDisplay(tempWakeTime).split(' ')[1]}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={openWakePicker}
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                        backgroundColor: isDark ? 'rgba(251, 146, 60, 0.15)' : 'rgba(251, 146, 60, 0.08)',
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: isDark ? 'rgba(251, 146, 60, 0.3)' : 'rgba(251, 146, 60, 0.2)',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontWeight: '600',
                                            fontFamily: 'Manrope_600SemiBold',
                                            color: isDark ? '#FB923C' : '#F97316',
                                        }}
                                    >
                                        Adjust
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Time Pickers */}
            {showSleepPicker && Platform.OS !== 'web' && (
                <DateTimePicker
                    value={parseTimeToDate(tempSleepTime)}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onSleepPickerChange}
                />
            )}

            {showWakePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                    value={parseTimeToDate(tempWakeTime)}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onWakePickerChange}
                />
            )}

            <WebTimePicker
                visible={showWebSleepPicker}
                value={parseTimeToDate(tempSleepTime)}
                onChange={handleSleepTimeChange}
                onClose={() => setShowWebSleepPicker(false)}
            />

            <WebTimePicker
                visible={showWebWakePicker}
                value={parseTimeToDate(tempWakeTime)}
                onChange={handleWakeTimeChange}
                onClose={() => setShowWebWakePicker(false)}
            />
        </>
    );
};
