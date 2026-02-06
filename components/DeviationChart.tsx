import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Circle, Defs, Path, Stop, Svg, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { Colors } from '../constants/theme';
import { DashboardDay } from '../data/dashboardData';
import { useColorScheme } from '../hooks/use-color-scheme';
import { WebTimePicker } from './WebTimePicker';

const CHART_HEIGHT = 220;
const CENTER_LINE = CHART_HEIGHT / 2;
const COLUMN_WIDTH = 45;

// Dark blue for light mode, light blue for dark mode
const getEarlyColor = (isDark: boolean) => isDark ? '#00E5FF' : '#0284C7';

const formatDeviation = (deviation: number): string => {
    if (deviation === 0) return '0m';
    const absDeviation = Math.abs(deviation);
    const sign = deviation > 0 ? '+' : '-';
    
    if (absDeviation < 60) {
        return `${sign}${absDeviation}m`;
    }
    
    const hours = Math.floor(absDeviation / 60);
    const minutes = absDeviation % 60;
    
    if (minutes === 0) {
        return `${sign}${hours}h`;
    }
    return `${sign}${hours}h ${minutes}m`;
};

const getDeviationHeight = (deviation: number) => {
    if (Math.abs(deviation) <= 5) {
        return 2;
    }
    // Scale: 1px per minute, max 60px (1 hour)
    return Math.min(Math.abs(deviation), 60);
};

const getDeviationY = (deviation: number) => {
    const height = getDeviationHeight(deviation);
    if (deviation > 5) {
        return CENTER_LINE - height;
    }
    if (deviation < -5) {
        return CENTER_LINE + height;
    }
    return CENTER_LINE;
};

const createSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) {
        return '';
    }
    if (points.length === 2) {
        return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];
        
        if (i === 1) {
            // First segment - use simple curve
            const cpX = (prev.x + curr.x) / 2;
            path += ` Q ${cpX} ${prev.y}, ${curr.x} ${curr.y}`;
        } else if (i === points.length - 1) {
            // Last segment
            const cpX = (prev.x + curr.x) / 2;
            path += ` Q ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
        } else if (next) {
            // Middle segments - smooth cubic bezier using Catmull-Rom spline style
            const cp1x = prev.x + (curr.x - points[i - 2].x) / 6;
            const cp1y = prev.y + (curr.y - points[i - 2].y) / 6;
            const cp2x = curr.x - (next.x - prev.x) / 6;
            const cp2y = curr.y - (next.y - prev.y) / 6;
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
        }
    }
    return path;
};

interface CombinedLineOverlayProps {
    data: DashboardDay[];
    theme: typeof Colors.light;
    isDark: boolean;
}

const CombinedLineOverlay: React.FC<CombinedLineOverlayProps> = ({ data, theme, isDark }) => {
    const earlyColor = getEarlyColor(isDark);
    const plottedPoints = data
        .map((day, index) => {
            if (day.isFuture) {
                return null;
            }
            const height = getDeviationHeight(day.deviationMinutes);
            let y: number;
            if (day.deviationMinutes > 5) {
                y = CENTER_LINE - height;
            } else if (day.deviationMinutes < -5) {
                y = CENTER_LINE + height;
            } else {
                y = CENTER_LINE;
            }
            return {
                id: day.id,
                x: index * COLUMN_WIDTH + COLUMN_WIDTH / 2,
                y,
                color: day.deviationMinutes > 5 ? theme.accent : day.deviationMinutes < -5 ? earlyColor : theme.textSecondary,
            };
        })
        .filter((point): point is { id: string; x: number; y: number; color: string } => point !== null);

    const linePath = createSmoothPath(plottedPoints);

    return (
        <Svg
            width={Math.max(data.length * COLUMN_WIDTH, 1)}
            height={CHART_HEIGHT}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 5 }}
        >
            <Defs>
                <SvgLinearGradient id="deviationLineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={theme.accent} />
                    <Stop offset="50%" stopColor={theme.accent} />
                    <Stop offset="50%" stopColor={earlyColor} />
                    <Stop offset="100%" stopColor={earlyColor} />
                </SvgLinearGradient>
            </Defs>

            {linePath ? (
                <Path
                    d={linePath}
                    fill="none"
                    stroke="url(#deviationLineGradient)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                />
            ) : null}

            {plottedPoints.map((point) => (
                <Circle
                    key={point.id}
                    cx={point.x}
                    cy={point.y}
                    r={4}
                    fill={point.color}
                    stroke={theme.card}
                    strokeWidth={2}
                />
            ))}
        </Svg>
    );
};

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

    const barHeight = Math.min(Math.abs(deviation), 60);

    // Handle zero deviation case
    const displayHeight = deviation === 0 ? 2 : barHeight;

    // Use theme colors: Dark blue for Early in light mode, light blue in dark mode; Accent for Late
    const earlyColor = getEarlyColor(isDark);
    const barColor = isLate ? theme.accent : earlyColor;
    const textColor = isLate ? theme.accent : earlyColor;

    return (
        <View className="flex-col items-center relative h-full" style={{ width: COLUMN_WIDTH }}>
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
                    className={`w-4 ${isLate ? 'rounded-t-md' : isEarly ? 'rounded-b-md' : 'rounded-sm'}`}
                    style={{
                        height: displayHeight,
                        backgroundColor: barColor,
                        position: 'absolute',
                        top: isLate ? CENTER_LINE - displayHeight : (isOnTime ? CENTER_LINE - 1 : CENTER_LINE),
                        left: '50%',
                        marginLeft: -8,
                        zIndex: 1,
                        ...(isDark ? {
                            boxShadow: `0px 0px 6px ${barColor}80`, // 50% opacity
                        } : {
                            boxShadow: `0px 2px 4px ${barColor}33`, // 20% opacity
                        })
                    } as any}
                >
                    {/* Inner highlight */}
                    <View className="absolute inset-0 bg-white/10 rounded-md" />
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
                        {isOnTime && deviation !== 0 ? '±0m' : formatDeviation(deviation)}
                    </Text>
                </View>
            )}

            <View className="absolute bottom-0 items-center" style={{ opacity: day.isFuture ? 0.4 : 1 }}>
                <Text
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{
                        fontFamily: 'Manrope_700Bold',
                        color: day.isToday ? getEarlyColor(isDark) : theme.textSecondary
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

interface DeviationLineProps {
    day: DashboardDay;
    index: number;
    totalDays: number;
    isToday?: boolean;
    theme: typeof Colors.light;
    isDark: boolean;
}

const DeviationLine: React.FC<DeviationLineProps> = ({ day, index, totalDays, isToday, theme, isDark }) => {
    const deviation = day.deviationMinutes;
    const isLate = deviation > 5;
    const isEarly = deviation < -5;
    const isOnTime = Math.abs(deviation) <= 5;

    // Calculate position - 1px per minute to match bars and Y-axis
    const x = 32 + index * 64; // Start after labels, 64px per day
    const maxDeviation = 60; // Maximum deviation for scaling
    const scaledDeviation = Math.max(-maxDeviation, Math.min(maxDeviation, deviation));
    const y = CENTER_LINE - scaledDeviation; // 1px per minute to match Y-axis

    // Use theme colors: Dark blue for Early in light mode, light blue in dark mode; Accent for Late
    const earlyColor = getEarlyColor(isDark);
    const pointColor = isLate ? theme.accent : earlyColor;
    const textColor = isLate ? theme.accent : earlyColor;

    return (
        <>
            {!day.isFuture && (
                <>
                    {/* Data point */}
                    <View
                        className="absolute rounded-full"
                        style={{
                            width: 8,
                            height: 8,
                            backgroundColor: pointColor,
                            opacity: isToday ? 1 : 0.8,
                            left: x - 4,
                            top: y - 4,
                            borderWidth: 2,
                            borderColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                            zIndex: 2,
                            ...(isDark ? {
                                boxShadow: `0px 0px 4px ${pointColor}80`, // 50% opacity
                            } : {
                                boxShadow: `0px 1px 2px ${pointColor}4D`, // 30% opacity
                            })
                        }}
                    />
                    
                    {/* Glow effect for today */}
                    {isToday && (
                        <View
                            className="absolute rounded-full"
                            style={{
                                width: 16,
                                height: 16,
                                backgroundColor: pointColor,
                                opacity: 0.2,
                                left: x - 8,
                                top: y - 8,
                                zIndex: 1,
                            }}
                        />
                    )}
                    
                    {/* Deviation label */}
                    <Text
                        className="text-[9px] font-bold absolute"
                        style={{
                            color: deviation === 0 ? theme.textSecondary : textColor,
                            fontFamily: 'Manrope_700Bold',
                            left: x - 12,
                            top: isLate ? y - 20 : y + 8,
                            textAlign: 'center',
                            zIndex: 3,
                        }}
                    >
                        {isOnTime && deviation !== 0 ? '±0m' : formatDeviation(deviation)}
                    </Text>
                    
                    {/* Day and Date labels at bottom */}
                    <View 
                        className="absolute items-center"
                        style={{ 
                            left: x - 32, 
                            bottom: -40,
                            width: 64,
                            opacity: day.isFuture ? 0.4 : 1 
                        }}
                    >
                        <Text
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{
                                fontFamily: 'Manrope_700Bold',
                                color: day.isToday ? getEarlyColor(isDark) : theme.textSecondary
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
                </>
            )}
        </>
    );
};

interface DeviationChartProps {
    data: DashboardDay[];
    onScroll?: (offset: number) => void;
    scrollRef?: React.RefObject<ScrollView | null>;
    wakeTarget: Date;
    onWakeTargetChange: (target: Date) => void;
}

type ChartMode = 'combined';

export const DeviationChart: React.FC<DeviationChartProps> = ({ data, onScroll, scrollRef, wakeTarget, onWakeTargetChange }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const isDark = colorScheme === 'dark';
    const theme = Colors[colorScheme];

    const [showPicker, setShowPicker] = useState(false);
    const [showWebPicker, setShowWebPicker] = useState(false);
    const [pickerValue, setPickerValue] = useState(wakeTarget);
    const [chartMode, setChartMode] = useState<ChartMode>('combined');
    // chartMode is always 'combined', toggle UI removed

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
                    web: { boxShadow: isDark ? '0px 10px 30px -10px rgba(0, 0, 0, 0.5)' : '0px 10px 15px -3px rgba(0, 0, 0, 0.1)' },
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
                        <View className="w-3 h-3 rounded-full" style={{ backgroundColor: getEarlyColor(isDark) }} />
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

                {/* Y-Axis Deviation Scale Labels - showing wider scale for context */}
                {/* +1h label (top) */}
                <View className="absolute left-0 px-2" style={{ top: CENTER_LINE - 60 - 7, backgroundColor: theme.card }}>
                    <Text className="text-[9px] font-bold" style={{ fontFamily: 'Manrope_700Bold', color: theme.textSecondary }}>+1h</Text>
                </View>
                {/* +30m label (upper) */}
                <View className="absolute left-0 px-2" style={{ top: CENTER_LINE - 30 - 7, backgroundColor: theme.card }}>
                    <Text className="text-[9px] font-bold" style={{ fontFamily: 'Manrope_700Bold', color: theme.textSecondary }}>+30m</Text>
                </View>
                {/* -30m label (lower) */}
                <View className="absolute left-0 px-2" style={{ top: CENTER_LINE + 30 - 7, backgroundColor: theme.card }}>
                    <Text className="text-[9px] font-bold" style={{ fontFamily: 'Manrope_700Bold', color: theme.textSecondary }}>-30m</Text>
                </View>
                {/* -1h label (bottom) */}
                <View className="absolute left-0 px-2" style={{ top: CENTER_LINE + 60 - 7, backgroundColor: theme.card }}>
                    <Text className="text-[9px] font-bold" style={{ fontFamily: 'Manrope_700Bold', color: theme.textSecondary }}>-1h</Text>
                </View>

                {/* Horizontal grid lines matching deviation reference */}
                <View className="absolute left-14 right-0 h-px" style={{ top: CENTER_LINE - 60, backgroundColor: theme.gridLine, opacity: 0.3 }} />
                <View className="absolute left-14 right-0 h-px" style={{ top: CENTER_LINE - 30, backgroundColor: theme.gridLine, opacity: 0.15 }} />
                <View className="absolute left-14 right-0 h-px" style={{ top: CENTER_LINE + 30, backgroundColor: theme.gridLine, opacity: 0.15 }} />
                <View className="absolute left-14 right-0 h-px" style={{ top: CENTER_LINE + 60, backgroundColor: theme.gridLine, opacity: 0.3 }} />

                {/* Chart Container with Gradients */}
                <View className="flex-1 ml-14 relative overflow-hidden">
                    <ScrollView
                        horizontal
                        ref={scrollRef}
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => onScroll?.(e.nativeEvent.contentOffset.x)}
                        scrollEventThrottle={16}
                        className="flex-1"
                    >
                        <View style={{ position: 'relative', height: CHART_HEIGHT, minWidth: data.length * COLUMN_WIDTH }}>
                            {/* Bars */}
                            <View className="flex-row h-full items-center" style={{ minWidth: data.length * COLUMN_WIDTH }}>
                                {data.map((day) => (
                                    <DeviationBar key={day.id} day={day} isToday={day.isToday} theme={theme} isDark={isDark} />
                                ))}
                            </View>
                            
                            {/* SVG Line Overlay */}
                            <CombinedLineOverlay data={data} theme={theme} isDark={isDark} />
                        </View>
                    </ScrollView>

                    {/* Left/Right Overlays */}
                    <LinearGradient
                        colors={[theme.card, 'transparent']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        className="absolute left-0 top-0 bottom-0 w-8 z-20"
                    />

                    <LinearGradient
                        colors={['transparent', theme.card]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        className="absolute right-0 top-0 bottom-0 w-8 z-20"
                    />
                </View>
            </View>

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

