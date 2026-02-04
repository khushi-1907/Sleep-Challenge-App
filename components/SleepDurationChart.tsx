import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MoonStar } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { DashboardDay } from '../data/dashboardData';
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
}

const SleepBar: React.FC<SleepBarProps> = ({ day, isToday, onPress }) => {
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
                        tint="light"
                        className="absolute inset-0"
                    />
                    <View className="absolute inset-0 bg-white/40 items-center justify-center">
                        <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter -rotate-90">Locked</Text>
                    </View>
                </View>
            )}

            {/* TODAY Badge */}
            {isToday && (
                <View className="absolute -top-8 z-30 bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 rounded-full" style={{
                  ...Platform.select({
                    web: { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
                    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 }
                  })
                }}>
                    <Text className="text-[10px] font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'Manrope_700Bold' }}>
                        Today
                    </Text>
                </View>
            )}
            <View
                className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent rounded-xl z-0 border border-blue-100/50"
                style={{
                    ...Platform.select({
                        web: {
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                        } as any,
                        default: {
                            shadowColor: '#2563eb',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 8,
                            elevation: 4,
                        },
                    }),
                }}
            />
            {!day.isFuture && (
                <TouchableOpacity
                    onPress={onPress}
                    activeOpacity={0.8}
                    className={`absolute w-8 rounded-full z-10 transition-all duration-200 ${isToday ? 'bg-gradient-to-b from-blue-500 to-blue-600' : 'bg-gradient-to-b from-primary to-primary/90'}`}
                    style={{
                        top: `${Math.max(0, topPos)}%`,
                        height: `${Math.min(100, heightPos)}%`,
                        minHeight: 24,
                        ...(Platform.OS === 'web' ? {
                            boxShadow: isToday ? '0 6px 16px rgba(37, 99, 235, 0.3)' : '0 4px 12px rgba(57, 163, 239, 0.25)'
                        } : {
                            shadowColor: isToday ? '#2563eb' : '#39a3ef',
                            shadowOffset: { width: 0, height: isToday ? 6 : 4 },
                            shadowOpacity: isToday ? 0.3 : 0.25,
                            shadowRadius: isToday ? 8 : 6,
                            elevation: isToday ? 6 : 4
                        })
                    } as any}
                >
                    <View className="absolute -top-6 left-0 right-0 items-center">
                        <Text className={`text-[10px] font-bold ${isToday ? 'text-blue-700' : 'text-primary'}`} style={{ fontFamily: 'Manrope_700Bold' }}>
                            {durationLabel}
                        </Text>
                    </View>
                    {/* Sleep time indicator */}
                    <View className="absolute bottom-0 left-1/2 -ml-1 w-2 h-2 bg-white/80 rounded-full" />
                    {/* Wake time indicator */}
                    <View className="absolute top-0 left-1/2 -ml-1 w-2 h-2 bg-white/60 rounded-full" />
                </TouchableOpacity>
            )}
            <View className="absolute bottom-0 items-center" style={{ opacity: day.isFuture ? 0.4 : 1 }}>
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

interface SleepDurationChartProps {
    data: DashboardDay[];
    onScroll?: (offset: number) => void;
    scrollRef?: React.RefObject<ScrollView | null>;
    onUpdateTime?: (dayId: string, type: 'sleep' | 'wake', time: string) => void;
}

export const SleepDurationChart: React.FC<SleepDurationChartProps> = ({ data, onScroll, scrollRef, onUpdateTime }) => {
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
        <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-6 mx-4" style={{
          ...Platform.select({
            web: { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
            default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 8 }
          })
        }}>
            <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center gap-3">
                    <View className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl" style={{
                      ...Platform.select({
                        web: { boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' },
                        default: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }
                      })
                    }}>
                        <MoonStar size={24} className="text-blue-600" />
                    </View>
                    <View>
                        <Text className="text-sm text-slate-500 font-medium" style={{ fontFamily: 'Manrope_500Medium' }}>Weekly Average</Text>
                        <Text className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Manrope_800ExtraBold' }}>7h 12m</Text>
                    </View>
                </View>
                            </View>

            <View className="relative flex-row" style={{ height: CHART_HEIGHT }}>
                {/* Y Axis */}
                <View className="w-12 flex-col justify-between pb-8">
                    {TIME_LABELS.map((label, i) => (
                        <Text key={i} className="text-[10px] text-slate-400 font-bold" style={{ fontFamily: 'Manrope_700Bold' }}>{label}</Text>
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
                            <View className="absolute inset-0 flex-col justify-between pb-8 opacity-10" style={{ pointerEvents: 'none', minWidth: data.length * 60 } as any}>{TIME_LABELS.map((_, i) => (
                                <View key={i} className="border-t border-slate-400 w-full" />
                            ))}</View>

                            {data.map((day) => (
                                <SleepBar
                                    key={day.id}
                                    day={day}
                                    isToday={day.isToday}
                                    onPress={() => handleBarPress(day)}
                                />
                            ))}
                        </View>
                    </ScrollView>

                    {/* Left Blur/Fade Effect */}
                    <LinearGradient
                        colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        className="absolute left-0 top-0 bottom-0 w-8 z-20"
                        style={{ pointerEvents: 'none' } as any}
                    />

                    <LinearGradient
                        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        className="absolute right-0 top-0 bottom-0 w-8 z-20"
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

