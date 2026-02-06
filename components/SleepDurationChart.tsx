import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MoonStar, Pencil, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/theme';
import { DashboardDay } from '../data/dashboardData';
import { useColorScheme } from '../hooks/use-color-scheme';
import { SleepEditorModal } from './SleepEditorModal';

const CHART_HEIGHT = 320;
const WINDOW_START_HOUR = 18; // 6 PM
const WINDOW_HOURS = 16; // 6 PM to 10 AM
const WINDOW_MINUTES = WINDOW_HOURS * 60;

const TIME_LABELS = [
    '10 AM', '8 AM', '6 AM', '4 AM', '2 AM', '12 AM', '10 PM', '8 PM', '6 PM'
];

// Helper function to format time display
const formatTimeDisplay = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHours = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHours}:${minutes} ${ampm}`;
};

interface SleepBarProps {
    day: DashboardDay;
    isToday?: boolean;
    isSelected?: boolean;
    onPress?: () => void;
    theme: typeof Colors.light;
    isDark: boolean;
}

// Dark blue for light mode, light blue for dark mode
const getEarlyColor = (isDark: boolean) => isDark ? '#00E5FF' : '#0284C7';

const SleepBar: React.FC<SleepBarProps> = ({ day, isToday, isSelected, onPress, theme, isDark }) => {
    const getBarColor = () => {
        if (isToday) {
            return theme.accent; // Use accent color (orange) for today to match theme
        }
        return getEarlyColor(isDark);
    };
    
    const barColor = getBarColor();
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
        <View className="flex-col items-center relative h-full" style={{ width: 45 }}>
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
                <View className="absolute w-6 z-10" style={{ top: `${Math.max(0, topPos)}%`, height: `${Math.min(100, heightPos)}%`, minHeight: 24 }}>
                    <TouchableOpacity
                        onPress={onPress}
                        activeOpacity={0.8}
                        className="w-full h-full rounded-full"
                        style={{
                            backgroundColor: barColor,
                            ...(isDark ? {
                                boxShadow: `0px 0px ${isToday ? 15 : 10}px ${theme.barGlow.shadowColor}${isToday ? 'CC' : '80'}`,
                            } : {
                                boxShadow: isToday ? `0px 4px 8px ${barColor}66` : 'none',
                            })
                        } as any}
                    >
                        <LinearGradient
                            colors={[barColor, barColor]}
                            style={{ flex: 1, borderRadius: 100 }}
                        />
                    </TouchableOpacity>

                    <View className="absolute -top-7 left-0 right-0 items-center">
                        <Text
                            className="text-[8px] font-bold"
                            style={{
                                fontFamily: 'Manrope_700Bold',
                                color: isToday ? barColor : theme.textSecondary
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
                        color: isToday ? barColor : theme.textSecondary
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

interface ExpandedBarViewProps {
    day: DashboardDay | null;
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    theme: typeof Colors.light;
    isDark: boolean;
}

const ExpandedBarView: React.FC<ExpandedBarViewProps> = ({ day, visible, onClose, onEdit, theme, isDark }) => {
    if (!visible || !day) return null;

    // Primary color - cyan for dark, blue for light
    const barColor = isDark ? '#00E5FF' : '#0284C7';
    const textColor = theme.textPrimary;
    const secondaryTextColor = theme.textSecondary;
    const lineColor = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)';

    const formatTimeDisplay = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHours = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return {
            time: `${displayHours}:${minutes}`,
            ampm: ampm
        };
    };

    const wakeTime = formatTimeDisplay(day.wakeTime);
    const sleepTime = formatTimeDisplay(day.sleepTime);
    const durationLabel = `${Math.floor(day.sleepMinutes / 60)}h ${day.sleepMinutes % 60}m`;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1 }}>
                {/* Light Blur Background */}
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.7)',
                    }}
                >
                    <BlurView
                        intensity={isDark ? 20 : 10}
                        tint={isDark ? "dark" : "light"}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        }}
                    />
                </View>

                {/* Close Button - Top Right */}
                <TouchableOpacity
                    onPress={onClose}
                    style={{
                        position: 'absolute',
                        top: Platform.OS === 'ios' ? 60 : 32,
                        right: 24,
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 101,
                        ...Platform.select({
                            web: { backdropFilter: 'blur(8px)' },
                            default: {}
                        }),
                    }}
                >
                    <X size={20} color={textColor} />
                </TouchableOpacity>

                {/* Main Content - Centered */}
                <View
                    pointerEvents="box-none"
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    {/* Top Info - Duration & Day */}
                    <View
                        pointerEvents="none"
                        style={{
                            position: 'absolute',
                            top: '15%',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{
                            fontSize: 12,
                            fontWeight: '700',
                            fontFamily: 'Manrope_700Bold',
                            color: barColor,
                            textTransform: 'uppercase',
                            letterSpacing: 2,
                            marginBottom: 8,
                        }}>
                            {day.dateLabel}
                        </Text>
                        <Text style={{
                            fontSize: 40,
                            fontWeight: '800',
                            fontFamily: 'Manrope_800ExtraBold',
                            color: textColor,
                        }}>
                            {durationLabel}
                        </Text>
                    </View>

                    {/* Bar with Times */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* Time Labels Column */}
                        <View style={{ marginRight: 16, alignItems: 'flex-end' }}>
                            {/* Wake Up - Top */}
                            <View style={{ alignItems: 'flex-end', marginBottom: 120 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ alignItems: 'flex-end', marginRight: 8 }}>
                                        <Text style={{
                                            fontSize: 20,
                                            fontWeight: '700',
                                            fontFamily: 'Manrope_700Bold',
                                            color: textColor,
                                        }}>
                                            {wakeTime.time}
                                        </Text>
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: '600',
                                            fontFamily: 'Manrope_600SemiBold',
                                            color: secondaryTextColor,
                                        }}>
                                            {wakeTime.ampm}
                                        </Text>
                                    </View>
                                    <View style={{
                                        width: 1,
                                        height: 40,
                                        backgroundColor: lineColor,
                                    }} />
                                </View>
                                <Text style={{
                                    fontSize: 10,
                                    fontWeight: '700',
                                    fontFamily: 'Manrope_700Bold',
                                    color: secondaryTextColor,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1.5,
                                    marginTop: 4,
                                }}>
                                    Wake Up
                                </Text>
                            </View>

                            {/* Sleep Time - Bottom */}
                            <View style={{ alignItems: 'flex-end', marginTop: 120 }}>
                                <Text style={{
                                    fontSize: 10,
                                    fontWeight: '700',
                                    fontFamily: 'Manrope_700Bold',
                                    color: secondaryTextColor,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1.5,
                                    marginBottom: 4,
                                }}>
                                    Fall Asleep
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ alignItems: 'flex-end', marginRight: 8 }}>
                                        <Text style={{
                                            fontSize: 20,
                                            fontWeight: '700',
                                            fontFamily: 'Manrope_700Bold',
                                            color: textColor,
                                        }}>
                                            {sleepTime.time}
                                        </Text>
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: '600',
                                            fontFamily: 'Manrope_600SemiBold',
                                            color: secondaryTextColor,
                                        }}>
                                            {sleepTime.ampm}
                                        </Text>
                                    </View>
                                    <View style={{
                                        width: 1,
                                        height: 40,
                                        backgroundColor: lineColor,
                                    }} />
                                </View>
                            </View>
                        </View>

                        {/* Main Zoomed Bar */}
                        <View style={{
                            width: 64,
                            height: 380,
                            borderRadius: 32,
                            backgroundColor: barColor,
                            position: 'relative',
                            ...Platform.select({
                                web: {
                                    boxShadow: isDark ? '0 0 25px rgba(0, 229, 255, 0.6)' : '0 0 25px rgba(2, 132, 199, 0.4)',
                                },
                                default: {
                                    shadowColor: barColor,
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: isDark ? 0.6 : 0.4,
                                    shadowRadius: 20,
                                    elevation: 20,
                                }
                            }),
                        }}>
                            {/* Gradient Overlay */}
                            <LinearGradient
                                colors={['rgba(255,255,255,0.2)', 'transparent', 'rgba(0,0,0,0.2)']}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: 32,
                                }}
                            />
                        </View>

                        {/* Edit Button - Right of Bar */}
                        <TouchableOpacity
                            onPress={onEdit}
                            style={{
                                marginLeft: 24,
                                alignItems: 'center',
                            }}
                        >
                            <View style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: '#FFFFFF',
                                alignItems: 'center',
                                justifyContent: 'center',
                                ...Platform.select({
                                    web: {
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                    },
                                    default: {
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 12,
                                        elevation: 10,
                                    }
                                }),
                            }}>
                                <Pencil size={24} color="#0F172A" />
                            </View>
                            <View style={{
                                marginTop: 8,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 8,
                                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                                borderWidth: 1,
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                ...Platform.select({
                                    web: { backdropFilter: 'blur(8px)' },
                                    default: {}
                                }),
                            }}>
                                <Text style={{
                                    fontSize: 10,
                                    fontWeight: '700',
                                    fontFamily: 'Manrope_700Bold',
                                    color: textColor,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                }}>
                                    Edit Data
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

interface SleepDurationChartProps {
    data: DashboardDay[];
    onScroll?: (offset: number) => void;
    scrollRef?: React.RefObject<ScrollView | null>;
    onBarPress?: (day: DashboardDay) => void;
    onUpdateDay?: (dayId: string, sleepTime: string, wakeTime: string) => void;
}

export const SleepDurationChart: React.FC<SleepDurationChartProps> = ({ data, onScroll, scrollRef, onBarPress, onUpdateDay }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const isDark = colorScheme === 'dark';
    const theme = Colors[colorScheme];
    const [selectedDay, setSelectedDay] = useState<DashboardDay | null>(null);
    const [showExpandedView, setShowExpandedView] = useState(false);
    const [showEditorModal, setShowEditorModal] = useState(false);
    const localScrollRef = React.useRef<ScrollView>(null);
    const scrollViewRef = scrollRef || localScrollRef;

    // Center today's bar on first render
    React.useEffect(() => {
        const todayIndex = data.findIndex(day => day.isToday);
        if (todayIndex !== -1 && scrollViewRef.current) {
            // Each bar is 45px wide, scroll to center today's bar
            // Assuming container width is roughly 300-350px (visible area)
            const barWidth = 45;
            const scrollTo = Math.max(0, (todayIndex * barWidth) - 150 + (barWidth / 2));
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ x: scrollTo, animated: false });
            }, 100);
        }
    }, [data]);

    const handleBarPress = (day: DashboardDay) => {
        if (!day.isFuture) {
            setSelectedDay(day);
            setShowExpandedView(true);
            onBarPress?.(day);
        }
    };

    const handleExpandedClose = () => {
        setShowExpandedView(false);
        setSelectedDay(null);
    };

    const handleEditPress = () => {
        setShowExpandedView(false);
        setShowEditorModal(true);
    };

    const handleSave = (dayId: string, sleepTime: string, wakeTime: string) => {
        onUpdateDay?.(dayId, sleepTime, wakeTime);
        setShowEditorModal(false);
        setSelectedDay(null);
    };

    const handleEditorClose = () => {
        setShowEditorModal(false);
        setSelectedDay(null);
    };

    // Calculate today's sleep duration
    const todayData = data.find(day => day.isToday);
    const todaySleepMinutes = todayData?.sleepMinutes ?? 0;
    const todayHours = Math.floor(todaySleepMinutes / 60);
    const todayMins = todaySleepMinutes % 60;
    const todayDurationLabel = `${todayHours}h ${todayMins}m`;

    return (
    <React.Fragment>
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
                        <MoonStar size={24} color={getEarlyColor(isDark)} />
                    </View>
                    <View>
                        <Text className="text-sm font-medium" style={{ fontFamily: 'Manrope_500Medium', color: theme.textSecondary }}>Today's Sleep</Text>
                        <Text className="text-2xl font-bold" style={{ fontFamily: 'Manrope_800ExtraBold', color: theme.textPrimary }}>{todayDurationLabel}</Text>
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
                        ref={scrollViewRef}
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => onScroll?.(e.nativeEvent.contentOffset.x)}
                        scrollEventThrottle={16}
                        className="flex-1"
                    >
                        <View className="flex-row h-full relative" style={{ width: data.length * 45 }}>
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
                                    isSelected={selectedDay?.id === day.id}
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
                    />

                    <LinearGradient
                        colors={['transparent', theme.card]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        className="absolute right-0 top-0 bottom-0 w-6 z-20"
                    />

                    {/* In-Place Zoomed Bar Overlay */}
                    <ExpandedBarView
                        day={selectedDay}
                        visible={showExpandedView}
                        onClose={handleExpandedClose}
                        onEdit={handleEditPress}
                        theme={theme}
                        isDark={isDark}
                    />
                </View>
            </View>
        </View>

        {/* Sleep Editor Modal */}
        <SleepEditorModal
            visible={showEditorModal}
            day={selectedDay}
            onClose={handleEditorClose}
            onSave={handleSave}
        />
    </React.Fragment>
);
};

