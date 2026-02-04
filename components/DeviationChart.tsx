import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/theme';
import { DashboardDay } from '../data/dashboardData';
import { useColorScheme } from '../hooks/use-color-scheme';
import { WebTimePicker } from './WebTimePicker';

const CHART_HEIGHT = 160;
const CENTER_LINE = CHART_HEIGHT / 2;

interface DeviationBarProps {
    day: DashboardDay;
    isToday?: boolean;
    theme: typeof Colors.light;
    isDark: boolean;
}

const DeviationBar: React.FC<DeviationBarProps> = ({ day, isToday, theme, isDark }) => {
    const deviation = day.deviationMinutes;
    const isLate = deviation > 5;
    const isEarly = deviation < -5;
    const isOnTime = Math.abs(deviation) <= 5;

    const barHeight = Math.min(Math.abs(deviation) * 2, 60);

    // Handle zero deviation case
    const displayHeight = deviation === 0 ? 2 : barHeight;

    // Use theme colors: Primary for Early, Accent for Late
    const barColor = isLate ? theme.accent : theme.primary;
    const textColor = isLate ? theme.accent : theme.primary;

    return (
        <View className="flex-col items-center w-16 relative h-full">
            {/* Future/Blur Overlay */}
            {day.isFuture && (
                <View className="absolute inset-x-0 top-0 bottom-[-32px] z-40 overflow-hidden rounded-xl">
                    <BlurView
                        intensity={40}
                        tint={isDark ? "dark" : "light"}
                        className="absolute inset-0"
                    />
                    <View className="absolute inset-0 items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.4)' }}>
                        <Text className="text-[8px] font-bold uppercase tracking-tighter" style={{ color: theme.textSecondary }}>Locked</Text>
                    </View>
                </View>
            )}

            {/* Selection Background for Today */}
            {isToday && (
                <View
                    className="absolute inset-0 rounded-xl z-0"
                    style={{
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(241, 245, 249, 0.5)',
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.5)',
                        bottom: -32,
                    }}
                />
            )}

            {!day.isFuture && (
                <View
                    className={`w-6 ${isLate ? 'rounded-t-lg' : isEarly ? 'rounded-b-lg' : 'rounded-sm'}`}
                    style={{
                        height: displayHeight,
                        backgroundColor: barColor,
                        position: 'absolute',
                        top: isLate ? CENTER_LINE - displayHeight : (isOnTime ? CENTER_LINE - 1 : CENTER_LINE),
                        left: '50%',
                        marginLeft: -12,
                        zIndex: 1,
                        ...(isDark ? {
                            shadowColor: barColor,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.5,
                            shadowRadius: 8,
                            elevation: 4,
                        } : {
                            shadowColor: barColor,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            elevation: 2,
                        })
                    } as any}
                >
                    {/* Inner highlight */}
                    <View className="absolute inset-0 bg-white/10 rounded-lg" />
                </View>
            )}

            {!day.isFuture && (
                <View
                    className="absolute w-full items-center"
                    style={{ top: isLate ? CENTER_LINE - displayHeight - 20 : CENTER_LINE + displayHeight + 5, zIndex: 1 }}
                >
                    <Text
                        className="text-[9px] font-bold"
                        style={{ color: deviation === 0 ? theme.textSecondary : textColor, fontFamily: 'Manrope_700Bold' }}
                    >
                        {isOnTime && deviation !== 0 ? '±0m' : (deviation === 0 ? '0m' : `${deviation > 0 ? '+' : ''}${deviation}m`)}
                    </Text>
                </View>
            )}

            <View className="absolute bottom-[-32px] items-center" style={{ opacity: day.isFuture ? 0.4 : 1 }}>
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

interface DeviationChartProps {
    data: DashboardDay[];
    onScroll?: (offset: number) => void;
    scrollRef?: React.RefObject<ScrollView | null>;
    wakeTarget: Date;
    onWakeTargetChange: (target: Date) => void;
}

export const DeviationChart: React.FC<DeviationChartProps> = ({ data, onScroll, scrollRef, wakeTarget, onWakeTargetChange }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const isDark = colorScheme === 'dark';
    const theme = Colors[colorScheme];

    const [showPicker, setShowPicker] = useState(false);
    const [showWebPicker, setShowWebPicker] = useState(false);
    const [pickerValue, setPickerValue] = useState(wakeTarget);

    const formatTargetTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleTargetPress = () => {
        setPickerValue(wakeTarget);
        if (Platform.OS === 'web') {
            setShowWebPicker(true);
        } else {
            setShowPicker(true);
        }
    };

    const onPickerChange = (event: any, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate) {
            onWakeTargetChange(selectedDate);
        }
    };

    const onWebTimeChange = (timeString: string) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const newTarget = new Date();
        newTarget.setHours(hours, minutes, 0, 0);
        onWakeTargetChange(newTarget);
    };

    return (
        <View
            className="rounded-2xl p-4 border mx-4 mt-6"
            style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
                ...Platform.select({
                    web: { boxShadow: isDark ? '0 10px 30px -10px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
                    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.3 : 0.1, shadowRadius: 10, elevation: 8 }
                })
            }}
        >
            <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row justify-center gap-6">
                    <View className="flex-row items-center gap-2">
                        <View className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accent }} />
                        <Text className="text-[10px] font-bold uppercase" style={{ fontFamily: 'Manrope_700Bold', color: theme.textSecondary }}>Late</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <View className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary }} />
                        <Text className="text-[10px] font-bold uppercase" style={{ fontFamily: 'Manrope_700Bold', color: theme.textSecondary }}>Early</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleTargetPress}
                    className="px-3 py-2 rounded-xl border flex-row items-center gap-2"
                    style={{
                        backgroundColor: isDark ? 'rgba(255, 140, 0, 0.1)' : 'rgba(255, 140, 0, 0.05)',
                        borderColor: isDark ? 'rgba(255, 140, 0, 0.2)' : 'rgba(255, 140, 0, 0.1)'
                    }}
                    activeOpacity={0.7}
                >
                    <Text
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ fontFamily: 'Manrope_700Bold', color: theme.accent }}
                    >
                        Target: {formatTargetTime(wakeTarget)}
                    </Text>
                    <Text style={{ color: theme.accent, fontSize: 10 }}>✎</Text>
                </TouchableOpacity>
            </View>

            <View className="relative w-full" style={{ height: CHART_HEIGHT }}>
                {/* Center Line */}
                <View
                    className="absolute left-0 right-0 h-px"
                    style={{ top: CENTER_LINE, backgroundColor: theme.gridLine }}
                />

                {/* Target Time Label */}
                <View className="absolute left-0 px-2 z-10" style={{ top: CENTER_LINE - 7, backgroundColor: theme.card }}>
                    <Text className="text-[10px] font-bold" style={{ fontFamily: 'Manrope_700Bold', color: theme.textSecondary }}>{formatTargetTime(wakeTarget)}</Text>
                </View>

                {/* Chart Container with Gradients */}
                <View className="flex-1 ml-16 relative overflow-hidden">
                    <ScrollView
                        horizontal
                        ref={scrollRef}
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => onScroll?.(e.nativeEvent.contentOffset.x)}
                        scrollEventThrottle={16}
                        className="flex-1"
                    >
                        <View className="flex-row h-full items-center" style={{ minWidth: data.length * 64 }}>{data.map((day) => (
                            <DeviationBar key={day.id} day={day} isToday={day.isToday} theme={theme} isDark={isDark} />
                        ))}</View>
                    </ScrollView>

                    {/* Left/Right Overlays */}
                    <LinearGradient
                        colors={[theme.card, 'transparent']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        className="absolute left-0 top-0 bottom-0 w-8 z-20"
                        style={{ pointerEvents: 'none' } as any}
                    />

                    <LinearGradient
                        colors={['transparent', theme.card]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        className="absolute right-0 top-0 bottom-0 w-8 z-20"
                        style={{ pointerEvents: 'none' } as any}
                    />
                </View>
            </View>

            {/* Spacer for labels */}
            <View className="h-10" />

            {/* Time Picker */}
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

