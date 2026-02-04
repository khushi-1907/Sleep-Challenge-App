import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { DashboardDay } from '../data/dashboardData';
import { WebTimePicker } from './WebTimePicker';

const CHART_HEIGHT = 160;
const CENTER_LINE = CHART_HEIGHT / 2;

interface DeviationBarProps {
    day: DashboardDay;
    isToday?: boolean;
}

const DeviationBar: React.FC<DeviationBarProps> = ({ day, isToday }) => {
    const deviation = day.deviationMinutes;
    const isLate = deviation > 5;
    const isEarly = deviation < -5;
    const isOnTime = Math.abs(deviation) <= 5;

    const barHeight = Math.min(Math.abs(deviation) * 2, 60);
    
    // Handle zero deviation case
    const displayHeight = deviation === 0 ? 2 : barHeight;

    // Green for early/on-time, Red for late
    const barColor = isLate ? '#ef4444' : '#22c55e'; // red-500 : green-500
    const textColor = isLate ? '#dc2626' : '#16a34a'; // red-600 : green-600

    return (
        <View className="flex-col items-center w-16 relative h-full">
            {/* Future/Blur Overlay */}
            {day.isFuture && (
                <View className="absolute inset-x-0 top-0 bottom-[-32px] z-40 overflow-hidden rounded-xl">
                    <BlurView
                        intensity={40}
                        tint="light"
                        className="absolute inset-0"
                    />
                    <View className="absolute inset-0 bg-white/40 items-center justify-center">
                        <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Locked</Text>
                    </View>
                </View>
            )}

            {/* TODAY Badge */}
            {isToday && (
                <View className="absolute -top-8 z-30 bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 rounded-full shadow-lg">
                    <Text className="text-[10px] font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'Manrope_700Bold' }}>
                        Today
                    </Text>
                </View>
            )}
            {isToday && (
                <View
                    className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent rounded-xl z-0 border border-blue-100/50"
                    style={{
                        ...(Platform.OS === 'web' ? {
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)'
                        } : {
                            shadowColor: '#2563eb',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 8,
                            elevation: 4
                        })
                    } as any}
                />
            )}
            {!day.isFuture && (
                <View
                    className={`w-6 ${isLate ? 'rounded-t-lg' : isEarly ? 'rounded-b-lg' : 'rounded-sm'} shadow-lg`}
                    style={{
                        height: displayHeight,
                        backgroundColor: barColor,
                        position: 'absolute',
                        top: isLate ? CENTER_LINE - displayHeight : (isOnTime ? CENTER_LINE - 1 : CENTER_LINE),
                        left: '50%',
                        marginLeft: -12,
                        zIndex: 1,
                        ...(Platform.OS === 'web' ? {
                            boxShadow: `0 4px 12px ${barColor}40`
                        } : {
                            shadowColor: barColor,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 6,
                            elevation: 4
                        })
                    } as any}
                >
                    {/* Inner glow effect */}
                    <View className="absolute inset-0 bg-white/20 rounded-lg" />
                </View>
            )}

            {!day.isFuture && (
                <View
                    className="absolute w-full items-center"
                    style={{ top: isLate ? CENTER_LINE - displayHeight - 20 : (isOnTime ? CENTER_LINE + displayHeight + 5 : CENTER_LINE + displayHeight + 5), zIndex: 1 }}
                >
                    <Text
                        className={`text-[9px] font-bold ${isToday ? 'text-blue-700' : ''}`}
                        style={{ color: deviation === 0 ? '#94a3b8' : (isToday ? '#1d4ed8' : textColor), fontFamily: 'Manrope_700Bold' }}
                    >
                        {isOnTime && deviation !== 0 ? '±0m' : (deviation === 0 ? '0m' : `${deviation > 0 ? '+' : ''}${deviation}m`)}
                    </Text>
                </View>
            )}

            <View className="absolute bottom-[-32px] items-center" style={{ opacity: day.isFuture ? 0.4 : 1 }}>
                <Text className={`text-xs font-bold ${isToday ? 'text-blue-600' : 'text-slate-500'}`} style={{ fontFamily: 'Manrope_700Bold' }}>
                    {day.dayLabel}
                </Text>
                <Text className={`text-[9px] font-medium ${isToday ? 'text-blue-500' : 'text-slate-400'}`} style={{ fontFamily: 'Manrope_500Medium' }}>
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
        <View className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 mx-4 mt-6">
            <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row justify-center gap-6">
                    <View className="flex-row items-center gap-2">
                        <View className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                        <Text className="text-xs font-bold text-slate-600 uppercase" style={{ fontFamily: 'Manrope_700Bold' }}>Late</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <View className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                        <Text className="text-xs font-bold text-slate-600 uppercase" style={{ fontFamily: 'Manrope_700Bold' }}>Early</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={handleTargetPress}
                    className="bg-orange-50 px-3 py-2 rounded-xl border border-orange-100 flex-row items-center gap-2"
                    activeOpacity={0.7}
                >
                    <Text className="text-orange-700 text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'Manrope_700Bold' }}>
                        Target: {formatTargetTime(wakeTarget)}
                    </Text>
                    <View className="w-3 h-3 items-center justify-center">
                        <Text className="text-orange-600 text-[10px] leading-none">✎</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View className="relative w-full" style={{ height: CHART_HEIGHT }}>
                {/* Center Line */}
                <View
                    className="absolute left-0 right-0 h-px bg-slate-200"
                    style={{ top: CENTER_LINE }}
                />

                {/* Target Time Label */}
                <View className="absolute left-0 bg-white px-2 z-10" style={{ top: CENTER_LINE - 6 }}>
                    <Text className="text-[10px] font-bold text-slate-400" style={{ fontFamily: 'Manrope_700Bold' }}>{formatTargetTime(wakeTarget)}</Text>
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
                            <DeviationBar key={day.id} day={day} isToday={day.isToday} />
                        ))}</View>
                    </ScrollView>

                    {/* Left Blur/Fade Effect */}
                    <LinearGradient
                        colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        className="absolute left-0 top-0 bottom-0 w-8 z-20"
                        style={{ pointerEvents: 'none' } as any}
                    />

                    {/* Right Blur/Fade Effect */}
                    <LinearGradient
                        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
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

