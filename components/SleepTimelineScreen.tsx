import React, { useRef, useState } from 'react';
import {
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

interface SleepData {
    date: Date;
    dateLabel: string;
    sleepTime: Date;
    wakeTime: Date;
    durationHours: number;
    deviationMinutes: number;
    isToday: boolean;
}

const TARGET_WAKE_HOUR = 5; // 5:00 AM target

// Generate dummy data for 30-60 days
const generateSleepData = (days: number = 45): SleepData[] => {
    const data: SleepData[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const isToday = i === 0;

        // Random sleep time between 21:00 and 23:30
        const sleepTime = new Date(date);
        sleepTime.setHours(21 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);

        // Random wake time between 4:30 and 6:30
        const wakeTime = new Date(date);
        wakeTime.setDate(wakeTime.getDate() + 1); // Next day
        wakeTime.setHours(4 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0, 0);

        // Calculate duration
        const durationMs = wakeTime.getTime() - sleepTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

        // Calculate deviation from 5:00 AM target
        const targetWakeTime = new Date(wakeTime);
        targetWakeTime.setHours(TARGET_WAKE_HOUR, 0, 0, 0);
        const deviationMinutes = Math.round((wakeTime.getTime() - targetWakeTime.getTime()) / (1000 * 60));

        // Format date label
        const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        data.push({
            date,
            dateLabel,
            sleepTime,
            wakeTime,
            durationHours,
            deviationMinutes,
            isToday,
        });
    }

    return data;
};

export default function SleepTimelineScreen() {
    const [sleepData] = useState<SleepData[]>(generateSleepData(45));
    const topScrollRef = useRef<ScrollView>(null);
    const bottomScrollRef = useRef<ScrollView>(null);
    const isScrollingTop = useRef(false);
    const isScrollingBottom = useRef(false);

    const colors = {
        primary: '#17cfcf',
        accent: '#2563eb',
        background: '#f8fafc',
        card: '#ffffff',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        barBackground: '#f1f5f9',
    };

    // Sync scroll between top and bottom
    const handleTopScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!isScrollingBottom.current) {
            isScrollingTop.current = true;
            const offsetX = event.nativeEvent.contentOffset.x;
            bottomScrollRef.current?.scrollTo({ x: offsetX, animated: false });
            setTimeout(() => {
                isScrollingTop.current = false;
            }, 50);
        }
    };

    const handleBottomScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!isScrollingTop.current) {
            isScrollingBottom.current = true;
            const offsetX = event.nativeEvent.contentOffset.x;
            topScrollRef.current?.scrollTo({ x: offsetX, animated: false });
            setTimeout(() => {
                isScrollingBottom.current = false;
            }, 50);
        }
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const renderSleepBar = (item: SleepData, index: number) => {
        const barHeight = 140;
        const maxDuration = 10; // Max 10 hours for scale
        const fillHeight = Math.min((item.durationHours / maxDuration) * barHeight, barHeight);

        return (
            <View key={`sleep-${index}`} style={styles.barContainer}>
                <View style={styles.timeLabels}>
                    <Text style={styles.timeText}>{formatTime(item.sleepTime)}</Text>
                    <Text style={styles.timeText}>{formatTime(item.wakeTime)}</Text>
                </View>
                <View style={[styles.sleepBarWrapper, { height: barHeight }]}>
                    <View
                        style={[
                            styles.sleepBarFill,
                            {
                                height: fillHeight,
                                backgroundColor: item.isToday ? colors.accent : colors.primary,
                                borderWidth: item.isToday ? 2 : 0,
                                borderColor: item.isToday ? colors.accent : 'transparent',
                            }
                        ]}
                    />
                </View>
                <Text style={[styles.dateLabel, item.isToday && styles.dateLabelToday]}>
                    {item.dateLabel}
                </Text>
                {item.isToday && (
                    <View style={styles.todayBadge}>
                        <Text style={styles.todayBadgeText}>Today</Text>
                    </View>
                )}
            </View>
        );
    };

    const renderDeviationBar = (item: SleepData, index: number) => {
        const maxDeviation = 90; // Max 90 minutes for scale
        const barHeight = 100;
        const centerY = barHeight / 2;

        // Calculate bar height based on deviation
        const deviationHeight = Math.min(
            Math.abs(item.deviationMinutes) / maxDeviation * centerY,
            centerY
        );

        const isEarly = item.deviationMinutes < 0;
        const isOnTime = Math.abs(item.deviationMinutes) <= 5;

        let barColor = colors.success; // Early (green)
        if (!isEarly) {
            barColor = colors.danger; // Late (red)
        }
        if (isOnTime) {
            barColor = colors.success; // On time (green)
        }

        return (
            <View key={`deviation-${index}`} style={styles.barContainer}>
                <View style={[styles.deviationBarWrapper, { height: barHeight }]}>
                    {/* Baseline */}
                    <View style={[styles.baseline, { top: centerY - 1 }]} />

                    {/* Deviation bar */}
                    <View
                        style={[
                            styles.deviationBar,
                            {
                                height: deviationHeight,
                                backgroundColor: barColor,
                                top: isEarly ? centerY - deviationHeight : centerY,
                                borderWidth: item.isToday ? 2 : 0,
                                borderColor: item.isToday ? colors.text : 'transparent',
                            }
                        ]}
                    />
                </View>
                <Text style={[styles.deviationText, item.isToday && styles.deviationTextToday]}>
                    {item.deviationMinutes > 0 ? '+' : ''}{item.deviationMinutes}m
                </Text>
            </View>
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            backgroundColor: colors.card,
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 4,
        },
        headerSubtitle: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        section: {
            marginTop: 24,
        },
        sectionHeader: {
            paddingHorizontal: 20,
            marginBottom: 16,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        sectionDescription: {
            fontSize: 13,
            color: colors.textSecondary,
        },
        scrollContainer: {
            paddingHorizontal: 16,
        },
        barContainer: {
            alignItems: 'center',
            marginHorizontal: 6,
            width: 50,
        },
        timeLabels: {
            width: '100%',
            marginBottom: 8,
        },
        timeText: {
            fontSize: 9,
            color: colors.textSecondary,
            textAlign: 'center',
        },
        sleepBarWrapper: {
            width: 44,
            backgroundColor: colors.barBackground,
            borderRadius: 8,
            justifyContent: 'flex-end',
            overflow: 'hidden',
        },
        sleepBarFill: {
            width: '100%',
            borderRadius: 8,
        },
        dateLabel: {
            fontSize: 11,
            color: colors.textSecondary,
            marginTop: 8,
            fontWeight: '500',
        },
        dateLabelToday: {
            color: colors.accent,
            fontWeight: '700',
        },
        todayBadge: {
            backgroundColor: colors.accent,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 8,
            marginTop: 4,
        },
        todayBadgeText: {
            fontSize: 9,
            color: '#ffffff',
            fontWeight: '600',
        },
        deviationBarWrapper: {
            width: 44,
            position: 'relative',
            justifyContent: 'center',
        },
        baseline: {
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: colors.textSecondary,
            opacity: 0.3,
        },
        deviationBar: {
            position: 'absolute',
            left: '20%',
            width: '60%',
            borderRadius: 4,
        },
        deviationText: {
            fontSize: 10,
            color: colors.textSecondary,
            marginTop: 8,
            fontWeight: '600',
        },
        deviationTextToday: {
            color: colors.accent,
            fontWeight: '700',
        },
        legend: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginTop: 16,
            gap: 16,
        },
        legendItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        legendDot: {
            width: 12,
            height: 12,
            borderRadius: 6,
        },
        legendText: {
            fontSize: 12,
            color: colors.textSecondary,
        },
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sleep Timeline</Text>
                <Text style={styles.headerSubtitle}>
                    {sleepData.length} days of sleep data
                </Text>
            </View>

            {/* Sleep Timeline Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Sleep Duration</Text>
                    <Text style={styles.sectionDescription}>
                        Sleep time (left) to wake time (right)
                    </Text>
                </View>
                <ScrollView
                    ref={topScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                    onScroll={handleTopScroll}
                    scrollEventThrottle={16}
                >
                    {sleepData.map((item, index) => renderSleepBar(item, index))}
                </ScrollView>
            </View>

            {/* Deviation Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Wake-Up Deviation</Text>
                    <Text style={styles.sectionDescription}>
                        Deviation from 5:00 AM target
                    </Text>
                </View>
                <ScrollView
                    ref={bottomScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                    onScroll={handleBottomScroll}
                    scrollEventThrottle={16}
                >
                    {sleepData.map((item, index) => renderDeviationBar(item, index))}
                </ScrollView>

                {/* Legend */}
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                        <Text style={styles.legendText}>Early/On Time</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
                        <Text style={styles.legendText}>Late</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
