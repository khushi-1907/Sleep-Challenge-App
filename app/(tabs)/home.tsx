import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StatusBar, Text, View } from 'react-native';
import { DeviationChart } from '../../components/DeviationChart';
import { SleepDurationChart } from '../../components/SleepDurationChart';
import { SleepTimelineHeader } from '../../components/SleepTimelineHeader';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardDay, getDummyDashboardData } from '../../data/dashboardData';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { updateSleepData } from '../../services/sleepDataService';

export default function HomeScreen() {
    const [data, setData] = useState<DashboardDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasScrolledToToday, setHasScrolledToToday] = useState(false);

    const [wakeTarget, setWakeTarget] = useState<Date>(() => {
        const today = new Date();
        today.setHours(5, 0, 0, 0);
        return today;
    });
    const { user } = useAuth();

    const timelineScrollRef = useRef<ScrollView>(null);
    const deviationScrollRef = useRef<ScrollView>(null);
    const isScrollingTimeline = useRef(false);
    const isScrollingDeviation = useRef(false);

    const loadData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            setData(getDummyDashboardData());
        } catch (error) {
            setData(getDummyDashboardData());
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    useEffect(() => {
        // Recalculate all deviations when wakeTarget changes
        if (data.length > 0) {
            const newData = data.map(day => {
                const [wh, wm] = day.wakeTime.split(':').map(Number);
                let wakeDate = new Date(day.date);
                wakeDate.setHours(wh, wm, 0, 0);

                // Handle next-day wake times
                const [sh, sm] = day.sleepTime.split(':').map(Number);
                let sleepDate = new Date(day.date);
                sleepDate.setHours(sh, sm, 0, 0);

                if (wakeDate <= sleepDate) {
                    wakeDate.setDate(wakeDate.getDate() + 1);
                }

                const targetWakeDate = new Date(wakeDate);
                targetWakeDate.setHours(wakeTarget.getHours(), wakeTarget.getMinutes(), 0, 0);
                const deviationMinutes = Math.round((wakeDate.getTime() - targetWakeDate.getTime()) / (1000 * 60));

                return { ...day, deviationMinutes };
            });
            setData(newData);
        }
    }, [wakeTarget]);

    useEffect(() => {
        // Initial scroll to Today
        if (data.length > 0 && !hasScrolledToToday) {
            const todayIndex = data.findIndex(d => d.isToday);
            if (todayIndex !== -1) {
                setTimeout(() => {
                    const todayOffset = todayIndex * 45;
                    timelineScrollRef.current?.scrollTo({ x: todayOffset - 150, animated: false });
                    deviationScrollRef.current?.scrollTo({ x: todayOffset - 150, animated: false });
                    setHasScrolledToToday(true);
                }, 100);
            }
        }
    }, [data, hasScrolledToToday]);

    const formatTargetTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleUpdateDay = async (dayId: string, sleepTime: string, wakeTime: string) => {
        if (!user) return;

        try {
            // Optimistic update
            const oldData = [...data];
            const newData = data.map(d => {
                if (d.id === dayId) {
                    // Recalculate sleep minutes and deviation
                    const [sh, sm] = sleepTime.split(':').map(Number);
                    const [wh, wm] = wakeTime.split(':').map(Number);
                    
                    let sleepDate = new Date(d.date);
                    sleepDate.setHours(sh, sm, 0, 0);
                    
                    let wakeDate = new Date(d.date);
                    wakeDate.setHours(wh, wm, 0, 0);
                    
                    // Handle sleep crossing midnight
                    if (wakeDate <= sleepDate) {
                        wakeDate.setDate(wakeDate.getDate() + 1);
                    }
                    
                    const sleepMinutes = Math.round((wakeDate.getTime() - sleepDate.getTime()) / (1000 * 60));
                    
                    // Calculate deviation from target wake time
                    const targetWakeDate = new Date(wakeDate);
                    targetWakeDate.setHours(wakeTarget.getHours(), wakeTarget.getMinutes(), 0, 0);
                    const deviationMinutes = Math.round((wakeDate.getTime() - targetWakeDate.getTime()) / (1000 * 60));
                    
                    return {
                        ...d,
                        sleepTime,
                        wakeTime,
                        sleepMinutes,
                        deviationMinutes
                    };
                }
                return d;
            });
            
            setData(newData);

            const result = await updateSleepData(
                user.uid,
                dayId,
                sleepTime,
                wakeTime
            );

            if (!result.success) {
                setData(oldData);
            } else {
                // Optionally reload data after a small delay to ensure server sync
                setTimeout(() => loadData(true), 1000);
            }
        } catch (error) {
            console.error('Failed to update sleep data:', error);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadData(true);
    };

    const handleTimelineScroll = (offset: number) => {
        if (isScrollingDeviation.current) return;
        isScrollingTimeline.current = true;
        deviationScrollRef.current?.scrollTo({ x: offset, animated: false });
        setTimeout(() => { isScrollingTimeline.current = false; }, 50);
    };

    const handleDeviationScroll = (offset: number) => {
        if (isScrollingTimeline.current) return;
        isScrollingDeviation.current = true;
        timelineScrollRef.current?.scrollTo({ x: offset, animated: false });
        setTimeout(() => { isScrollingDeviation.current = false; }, 50);
    };

    const colorScheme = useColorScheme() ?? 'light';
    const isDark = colorScheme === 'dark';
    const theme = Colors[colorScheme];

    if (loading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text className="mt-4" style={{ fontFamily: 'Manrope_500Medium', color: theme.textSecondary }}>
                    Loading...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <SleepTimelineHeader />
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={loadData}
                        colors={[theme.primary]}
                        tintColor={theme.primary}
                    />
                }
            >
                <View className="mt-6 px-4 flex-row items-center justify-between mb-2">
                    <Text
                        className="text-[22px] font-bold tracking-tight"
                        style={{ fontFamily: 'Manrope_800ExtraBold', color: theme.textPrimary }}
                    >
                        Sleep Duration
                    </Text>
                </View>
                <SleepDurationChart
                    data={data}
                    scrollRef={timelineScrollRef}
                    onScroll={handleTimelineScroll}
                    onUpdateDay={handleUpdateDay}
                />
                <View className="px-4 mt-4">
                    <Text
                        className="text-[22px] font-bold tracking-tight mb-2"
                        style={{ fontFamily: 'Manrope_800ExtraBold', color: theme.textPrimary }}
                    >
                        Wake-Up Deviation
                    </Text>
                    <View className="flex-row items-center gap-2 mb-4">
                        <Text className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                            Target: <Text className="font-bold" style={{ fontFamily: 'Manrope_700Bold', color: theme.textPrimary }}>{formatTargetTime(wakeTarget)}</Text>
                        </Text>
                    </View>
                </View>
                <DeviationChart
                    data={data}
                    scrollRef={deviationScrollRef}
                    onScroll={handleDeviationScroll}
                    wakeTarget={wakeTarget}
                    onWakeTargetChange={setWakeTarget}
                />
                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
