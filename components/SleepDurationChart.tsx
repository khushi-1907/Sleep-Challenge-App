import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MoonStar } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/theme';
import { DashboardDay } from '../data/dashboardData';
import { useColorScheme } from '../hooks/use-color-scheme';
import { WebTimePicker } from './WebTimePicker';

const CHART_HEIGHT = 320;
const WINDOW_START_HOUR = 18; // 6 PM
const WINDOW_HOURS = 16; // 6 PM to 10 AM
const WINDOW_MINUTES = WINDOW_HOURS * 60;

const TIME_LABELS = [
    '10 AM', '8 AM', '6 AM', '4 AM', '2 AM', '12 AM', '10 PM', '8 PM', '6 PM'
];

interface SleepBarProps {
    day: DashboardDay;
    isToday?: boolean;
    onPress?: () => void;
    theme: typeof Colors.light;
    isDark: boolean;
}

const SleepBar: React.FC<SleepBarProps> = ({ day, isToday, onPress, theme, isDark }) => {
    // Calculate top and height positions for sleep bar within timeline window
    const parseTimeToMinutes = (timeStr: string, isNextDay: boolean) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        let totalMinutes = (hours - WINDOW_START_HOUR) * 60 + minutes;
        if (isNextDay || hours < WINDOW_START_HOUR) {
            totalMinutes += 24 * 60;
        }
        return totalMinutes;
    };

    const wakeMins = parseTimeToMinutes(day.wakeTime, true);
    const sleepMins = parseTimeToMinutes(day.sleepTime, false);

    const wakeFromTopMins = WINDOW_MINUTES - wakeMins;
    const topPos = (wakeFromTopMins / WINDOW_MINUTES) * 100;
    const heightPos = ((wakeMins - sleepMins) / WINDOW_MINUTES) * 100;

    const durationLabel = `${Math.floor(day.sleepMinutes / 60)}h ${day.sleepMinutes % 60}m`;

    return (
        <View className="flex-col items-center flex-1 relative h-full" style={{ minWidth: 60 }}>
            {/* Future/Blur Overlay */}
            {day.isFuture && (
                <View className="absolute inset-0 z-40 overflow-hidden rounded-xl">
                    <BlurView
                        intensity={40}
                        tint={isDark ? "dark" : "light"}
                        className="absolute inset-0"
                    />
                    <View className="absolute inset-0 items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.4)' }}>
                        <Text className="text-[8px] font-bold uppercase tracking-tighter -rotate-90" style={{ color: theme.textSecondary }}>Locked</Text>
                    </View>
                </View>
            )}

            {/* Background track */}
            <View
                className="absolute inset-0 rounded-xl z-0"
                style={{
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(241, 245, 249, 0.5)',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.5)',
                }}
            />

            {!day.isFuture && (
                <View className="absolute w-8 z-10" style={{ top: `${Math.max(0, topPos)}%`, height: `${Math.min(100, heightPos)}%`, minHeight: 24 }}>
                    <TouchableOpacity
                        onPress={onPress}
                        activeOpacity={0.8}
                        className="w-full h-full rounded-full"
                        style={{
                            backgroundColor: theme.primary,
                            borderWidth: isToday ? 2 : 0,
                            borderColor: isToday ? '#FFFFFF' : 'transparent',
                            ...(isDark ? {
                                shadowColor: theme.barGlow.shadowColor,
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: isToday ? 0.8 : theme.barGlow.shadowOpacity,
                                shadowRadius: isToday ? 15 : 10,
                                elevation: isToday ? 12 : 8,
                            } : {
                                shadowColor: theme.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: isToday ? 0.4 : 0,
                                shadowRadius: 8,
                                elevation: isToday ? 6 : 0,
                            })
                        } as any}
                    >
                        <LinearGradient
                            colors={isToday ? ['#FFFFFF', theme.primary] : [theme.primary, theme.primary]}
                            style={{ flex: 1, borderRadius: 100 }}
                        />
                        {/* Sleep/Wake indicators */}
                        {isToday && (
                            <>
                                <View className="absolute bottom-1 left-1/2 -ml-1 w-2 h-2 bg-white/40 rounded-full" />
                                <View className="absolute top-1 left-1/2 -ml-1 w-2 h-2 bg-white/60 rounded-full" />
                            </>
                        )}
                    </TouchableOpacity>

                    <View className="absolute -top-6 left-0 right-0 items-center">
                        <Text
                            className="text-[10px] font-bold"
                            style={{
                                fontFamily: 'Manrope_700Bold',
                                color: isToday ? theme.primary : theme.textSecondary
                            }}
                        >
                            {durationLabel}
                        </Text>
                    </View>
                </View>
            )}

            <View className="absolute bottom-0 items-center" style={{ opacity: day.isFuture ? 0.4 : 1 }}>
                <Text
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{
                        fontFamily: 'Manrope_700Bold',
                        color: isToday ? theme.primary : theme.textSecondary
                    }}
                >
                    {day.dayLabel.substring(0, 3)}
                </Text>
                <Text
                    className="text-[9px] font-medium"
                    style={{
                        fontFamily: 'Manrope_500Medium',
                        color: isDark ? '#64748B' : '#94A3B8'
                    }}
                >
                    {day.dateLabel}
                </Text>
            </View>
        </View>
    );
};

interface SleepDurationChartProps {
    data: DashboardDay[];
    onScroll?: (offset: number) => void;
    scrollRef?: React.RefObject<ScrollView | null>;
    onUpdateTime?: (dayId: string, type: 'sleep' | 'wake', time: string) => void;
}

export const SleepDurationChart: React.FC<SleepDurationChartProps> = ({ data, onScroll, scrollRef, onUpdateTime }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const isDark = colorScheme === 'dark';
    const theme = Colors[colorScheme];

    const [showPicker, setShowPicker] = useState(false);
    const [showWebPicker, setShowWebPicker] = useState(false);
    const [editingDayId, setEditingDayId] = useState<string | null>(null);
    const [editingType, setEditingType] = useState<'sleep' | 'wake'>('wake');
    const [pickerValue, setPickerValue] = useState(new Date());

    const handleBarPress = (day: DashboardDay) => {
        setEditingDayId(day.id);
        setEditingType('wake');
        const [h, m] = day.wakeTime.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m);
        setPickerValue(date);

        if (Platform.OS === 'web') {
            setShowWebPicker(true);
        } else {
            setShowPicker(true);
        }
    };

    const onPickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate && editingDayId) {
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            onUpdateTime?.(editingDayId, editingType, `${hours}:${minutes}`);
        }
    };

    const onWebTimeChange = (timeString: string) => {
        if (editingDayId) {
            onUpdateTime?.(editingDayId, editingType, timeString);
        }
    };

    return (
        <View
            className="rounded-2xl p-4 mb-6 mx-4 border"
            style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
                ...Platform.select({
                    web: { boxShadow: isDark ? '0 10px 30px -10px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
                    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.3 : 0.1, shadowRadius: 10, elevation: 8 }
                })
            }}
        >
            <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center gap-3">
                    <View
                        className="p-3 rounded-xl"
                        style={{
                            backgroundColor: isDark ? 'rgba(0, 229, 255, 0.1)' : 'rgba(0, 229, 255, 0.05)',
                        }}
                    >
                        <MoonStar size={24} color={theme.primary} />
                    </View>
                    <View>
                        <Text className="text-sm font-medium" style={{ fontFamily: 'Manrope_500Medium', color: theme.textSecondary }}>Weekly Average</Text>
                        <Text className="text-2xl font-bold" style={{ fontFamily: 'Manrope_800ExtraBold', color: theme.textPrimary }}>7h 12m</Text>
                    </View>
                </View>
            </View>

            <View className="relative flex-row" style={{ height: CHART_HEIGHT }}>
                {/* Y Axis */}
                <View className="w-12 flex-col justify-between pb-8">
                    {TIME_LABELS.map((label, i) => (
                        <Text key={i} className="text-[10px] font-bold" style={{ fontFamily: 'Manrope_700Bold', color: theme.textSecondary }}>{label}</Text>
                    ))}
                </View>

                {/* Chart Bars Container with Gradient Overlays */}
                <View className="flex-1 ml-2 relative overflow-hidden">
                    <ScrollView
                        horizontal
                        ref={scrollRef}
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => onScroll?.(e.nativeEvent.contentOffset.x)}
                        scrollEventThrottle={16}
                        className="flex-1"
                    >
                        <View className="flex-row h-full relative" style={{ minWidth: data.length * 60 }}>
                            {/* Grid Lines */}
                            <View className="absolute inset-0 flex-col justify-between pb-8" style={{ pointerEvents: 'none', opacity: 0.5 }}>
                                {TIME_LABELS.map((_, i) => (
                                    <View key={i} className="w-full" style={{ borderTopWidth: 1, borderTopColor: theme.gridLine, borderStyle: 'dashed' }} />
                                ))}
                            </View>

                            {data.map((day) => (
                                <SleepBar
                                    key={day.id}
                                    day={day}
                                    isToday={day.isToday}
                                    onPress={() => handleBarPress(day)}
                                    theme={theme}
                                    isDark={isDark}
                                />
                            ))}
                        </View>
                    </ScrollView>

                    {/* Left/Right Overlays */}
                    <LinearGradient
                        colors={[theme.card, 'transparent']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        className="absolute left-0 top-0 bottom-0 w-6 z-20"
                        style={{ pointerEvents: 'none' } as any}
                    />

                    <LinearGradient
                        colors={['transparent', theme.card]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        className="absolute right-0 top-0 bottom-0 w-6 z-20"
                        style={{ pointerEvents: 'none' } as any}
                    />
                </View>
            </View>

            {showPicker && Platform.OS !== 'web' && (
                <DateTimePicker
                    value={pickerValue}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onPickerChange}
                />
            )}
            <WebTimePicker
                visible={showWebPicker}
                value={pickerValue}
                onChange={onWebTimeChange}
                onClose={() => setShowWebPicker(false)}
            />
        </View>
    );
};

