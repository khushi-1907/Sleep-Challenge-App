import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/theme';
import { addDays, calculateMinutesBetween, DashboardDay, parseTimeToDate } from '../data/dashboardData';
import { useColorScheme } from '../hooks/use-color-scheme';
import { WebTimePicker } from './WebTimePicker';

const WINDOW_START_HOUR = 18; // 6 PM
const WINDOW_HOURS = 16; // 6 PM to 10 AM
const WINDOW_MINUTES = WINDOW_HOURS * 60;

interface SleepLogBottomSheetProps {
    visible: boolean;
    day: DashboardDay | null;
    onClose: () => void;
    onApply: (updatedDay: DashboardDay) => void;
}

export const SleepLogBottomSheet: React.FC<SleepLogBottomSheetProps> = ({ visible, day, onClose, onApply }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const isDark = colorScheme === 'dark';
    const theme = Colors[colorScheme];

    const [tempDay, setTempDay] = useState<DashboardDay | null>(null);
    const [animation] = useState(new Animated.Value(0));

    // Time picker state
    const [showPicker, setShowPicker] = useState(false);
    const [showWebPicker, setShowWebPicker] = useState(false);
    const [pickerType, setPickerType] = useState<'sleep' | 'wake'>('sleep');
    const [pickerValue, setPickerValue] = useState(new Date());

    useEffect(() => {
        if (visible && day) {
            setTempDay({ ...day });
            Animated.timing(animation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(animation, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, day]);

    if (!tempDay) return null;

    const handleTimeChange = (type: 'sleep' | 'wake', timeStr: string) => {
        const updatedDay = { ...tempDay };
        if (type === 'sleep') updatedDay.sleepTime = timeStr;
        else updatedDay.wakeTime = timeStr;

        // Recalculate duration & deviation
        const baseDate = new Date(updatedDay.date);
        const sleepDate = parseTimeToDate(updatedDay.sleepTime, baseDate);
        let wakeDate = parseTimeToDate(updatedDay.wakeTime, baseDate);

        // Cross-midnight handling
        if (wakeDate <= sleepDate) {
            wakeDate = addDays(wakeDate, 1);
        }

        updatedDay.sleepMinutes = calculateMinutesBetween(sleepDate, wakeDate);

        // Recalculate deviation
        const targetWakeDate = parseTimeToDate(updatedDay.targetWakeTime, wakeDate);
        updatedDay.deviationMinutes = calculateMinutesBetween(targetWakeDate, wakeDate);

        setTempDay(updatedDay);
    };

    const openPicker = (type: 'sleep' | 'wake') => {
        setPickerType(type);
        const timeStr = type === 'sleep' ? tempDay.sleepTime : tempDay.wakeTime;
        const [h, m] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m, 0, 0);
        setPickerValue(date);

        if (Platform.OS === 'web') setShowWebPicker(true);
        else setShowPicker(true);
    };

    const onPickerConfirm = (event: any, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate) {
            const h = selectedDate.getHours().toString().padStart(2, '0');
            const m = selectedDate.getMinutes().toString().padStart(2, '0');
            handleTimeChange(pickerType, `${h}:${m}`);
        }
    };

    const onWebTimeSelect = (timeStr: string) => {
        handleTimeChange(pickerType, timeStr);
    };

    // UI Helpers
    const formatLabel = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return { hour: displayH.toString().padStart(2, '0'), min: m.toString().padStart(2, '0'), period };
    };

    const parseTimeToMinutes = (timeStr: string, isNextDay: boolean) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        let totalMinutes = (hours - WINDOW_START_HOUR) * 60 + minutes;
        if (isNextDay || hours < WINDOW_START_HOUR) {
            totalMinutes += 24 * 60;
        }
        return totalMinutes;
    };

    const wakeMins = parseTimeToMinutes(tempDay.wakeTime, true);
    const sleepMins = parseTimeToMinutes(tempDay.sleepTime, false);
    const wakeFromTopMins = WINDOW_MINUTES - wakeMins;
    const topPos = (wakeFromTopMins / WINDOW_MINUTES) * 100;
    const heightPos = ((wakeMins - sleepMins) / WINDOW_MINUTES) * 100;

    const durationLabel = `${Math.floor(tempDay.sleepMinutes / 60)}h ${tempDay.sleepMinutes % 60}m`;
    const bedtime = formatLabel(tempDay.sleepTime);
    const wakeup = formatLabel(tempDay.wakeTime);

    const translateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [Dimensions.get('window').height, 0],
    });

    const backdropOpacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <View className="flex-1 justify-end">
                <Animated.View style={{ opacity: backdropOpacity }} className="absolute inset-0">
                    <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1">
                        <BlurView intensity={20} tint="dark" className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View
                    style={{ transform: [{ translateY }] }}
                    className="rounded-t-[32px] overflow-hidden"
                >
                    <View
                        className="p-6 pb-10"
                        style={{ backgroundColor: isDark ? '#101622' : '#FFFFFF' }}
                    >
                        {/* Drawer Handle */}
                        <View className="items-center mb-4">
                            <View className="w-12 h-1.5 rounded-full bg-slate-300/30" />
                        </View>

                        {/* Custom Sticky Header */}
                        <View className="flex-row items-center justify-between mb-8">
                            <TouchableOpacity onPress={onClose} className="p-2">
                                <Ionicons name="close" size={24} color={isDark ? "white" : "#0F172A"} />
                            </TouchableOpacity>
                            <Text className="text-xl font-bold" style={{ fontFamily: 'Manrope_800ExtraBold', color: isDark ? "white" : "#0F172A" }}>
                                Edit Sleep Log
                            </Text>
                            <TouchableOpacity onPress={() => onApply(tempDay)}>
                                <Text className="text-base font-bold" style={{ color: theme.primary }}>Save</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Visual Timeline Section */}
                        <View className="mb-8">
                            <View className="flex-row items-center justify-between mb-4">
                                <View>
                                    <Text className="text-lg font-bold" style={{ color: isDark ? "white" : "#0F172A" }}>Visual Timeline</Text>
                                    <Text className="text-sm" style={{ color: theme.textSecondary }}>Drag or tap to adjust sleep sessions.</Text>
                                </View>
                                <View className="px-3 py-1 rounded-full" style={{ backgroundColor: theme.primary + '20' }}>
                                    <Text className="text-[10px] font-bold uppercase" style={{ color: theme.primary }}>Editing</Text>
                                </View>
                            </View>

                            <View className="flex flex-col gap-6">
                                {/* Current Day (Editing) */}
                                <View className="relative">
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-sm font-semibold" style={{ color: isDark ? "white" : "#0F172A" }}>{tempDay.dateLabel}</Text>
                                    </View>
                                    <View className="h-12 w-full rounded-xl overflow-hidden relative justify-center px-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                        {/* Grid lines */}
                                        <View className="absolute inset-0 flex-row justify-between px-3 opacity-20 pointer-events-none">
                                            {[...Array(4)].map((_, i) => <View key={i} className="w-px h-full bg-white/20" />)}
                                        </View>

                                        <View
                                            className="h-8 rounded-lg flex-row items-center justify-between px-3"
                                            style={{
                                                position: 'absolute',
                                                left: `${(sleepMins / WINDOW_MINUTES) * 100}%`,
                                                width: `${((wakeMins - sleepMins) / WINDOW_MINUTES) * 100}%`,
                                                backgroundColor: theme.primary,
                                                boxShadow: `0px 4px 10px ${theme.primary}80`, // 50% opacity
                                                borderWidth: 1,
                                                borderColor: 'rgba(255,255,255,0.2)'
                                            }}
                                        >
                                            <View className="w-1.5 h-4 bg-white/40 rounded-full" />
                                            <Text className="text-white text-[10px] font-bold">{durationLabel}</Text>
                                            <View className="w-1.5 h-4 bg-white/40 rounded-full" />
                                        </View>
                                    </View>
                                    <View className="flex-row justify-between mt-2 px-1">
                                        <Text className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>{tempDay.sleepTime}</Text>
                                        <Text className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>{tempDay.wakeTime}</Text>
                                    </View>
                                </View>

                                {/* Background Sessions (Dimmed) */}
                                <View className="opacity-40">
                                    <Text className="text-xs font-medium mb-2" style={{ color: theme.textSecondary }}>Previous Session</Text>
                                    <View className="h-10 w-full rounded-xl relative justify-center px-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                                        <View
                                            className="h-6 rounded-lg bg-slate-500/30"
                                            style={{
                                                position: 'absolute',
                                                left: '10%',
                                                width: '50%',
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Adjust Controls */}
                            <View className="flex-row gap-4 mb-10">
                                {/* Bedtime Card */}
                            <TouchableOpacity
                                onPress={() => openPicker('sleep')}
                                className="flex-1 p-4 rounded-2xl border items-center justify-center gap-3"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                                }}
                            >
                                <Ionicons name="moon" size={20} color={theme.primary} />
                                <View className="items-center">
                                    <Text className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: theme.textSecondary }}>Bedtime</Text>
                                    <View className="flex-row items-baseline gap-1">
                                        <Text className="text-2xl font-bold" style={{ color: isDark ? "white" : "#0F172A" }}>{bedtime.hour}:{bedtime.min}</Text>
                                        <Text className="text-xs font-medium" style={{ color: theme.textSecondary }}>{bedtime.period}</Text>
                                    </View>
                                </View>
                                <View
                                    className="px-4 py-1 rounded-full mt-1"
                                    style={{ backgroundColor: theme.primary + '15' }}
                                >
                                    <Text className="text-[10px] font-bold" style={{ color: theme.primary }}>Adjust</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Wake Up Card */}
                            <TouchableOpacity
                                onPress={() => openPicker('wake')}
                                className="flex-1 p-4 rounded-2xl border items-center justify-center gap-3"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                                }}
                            >
                                <Ionicons name="sunny" size={20} color="#EAB308" />
                                <View className="items-center">
                                    <Text className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: theme.textSecondary }}>Wake Up</Text>
                                    <View className="flex-row items-baseline gap-1">
                                        <Text className="text-2xl font-bold" style={{ color: isDark ? "white" : "#0F172A" }}>{wakeup.hour}:{wakeup.min}</Text>
                                        <Text className="text-xs font-medium" style={{ color: theme.textSecondary }}>{wakeup.period}</Text>
                                    </View>
                                </View>
                                <View
                                    className="px-4 py-1 rounded-full mt-1"
                                    style={{ backgroundColor: theme.primary + '15' }}
                                >
                                    <Text className="text-[10px] font-bold" style={{ color: theme.primary }}>Adjust</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Apply Changes Button */}
                        <TouchableOpacity
                            onPress={() => onApply(tempDay)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[theme.primary, '#00C2FF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="w-full py-4 rounded-2xl items-center"
                                style={{ boxShadow: `0px 4px 10px ${theme.primary}66` }} // 40% opacity
                            >
                                <Text className="text-white font-bold text-lg">Apply Changes</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>

            {/* Sub Pickers */}
            {showPicker && Platform.OS !== 'web' && (
                <DateTimePicker
                    value={pickerValue}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onPickerConfirm}
                />
            )}
            <WebTimePicker
                visible={showWebPicker}
                value={pickerValue}
                onChange={onWebTimeSelect}
                onClose={() => setShowWebPicker(false)}
            />
        </Modal>
    );
};
