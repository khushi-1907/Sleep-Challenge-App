import { Timestamp } from 'firebase/firestore';
import { addDays, calculateMinutesBetween, DashboardDay, formatTimeHHmm, getDayLabel, parseTimeToDate } from '../data/dashboardData';
import { getAllSleepData, saveSleepData } from '../lib/firebase';

export const getFirebaseSleepData = async (userId: string): Promise<DashboardDay[]> => {
  try {
    const result = await getAllSleepData(userId);
    if (!result.success || !result.data) {
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetWakeTime = '05:00';

    const dashboardData: DashboardDay[] = [];

    // Convert Firebase data to DashboardDay format
    Object.entries(result.data).forEach(([dateKey, sleepData]) => {
      const date = sleepData.date.toDate();
      const isToday = date.toDateString() === today.toDateString();

      const dayEntry: DashboardDay = {
        id: dateKey,
        date: date.toISOString(),
        dayLabel: getDayLabel(date),
        dateLabel: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        sleepTime: formatTimeHHmm(sleepData.sleepTime.toDate()),
        wakeTime: formatTimeHHmm(sleepData.wakeTime.toDate()),
        sleepMinutes: Math.round(sleepData.durationHours * 60),
        targetWakeTime,
        deviationMinutes: sleepData.deviationMinutes,
        isToday,
        isFuture: date > today
      };

      dashboardData.push(dayEntry);
    });

    // Sort by date (newest first)
    dashboardData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return dashboardData;
  } catch (error) {
    return [];
  }
};

export const updateSleepData = async (
  userId: string,
  dayId: string,
  sleepTime: string,
  wakeTime: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Parse times to Date objects
    const baseDate = new Date(dayId);
    const sleepDate = parseTimeToDate(sleepTime, baseDate);
    let wakeDate = parseTimeToDate(wakeTime, baseDate);

    // Handle sleep crossing midnight
    if (wakeDate <= sleepDate) {
      wakeDate = addDays(wakeDate, 1);
    }

    // Calculate duration
    const durationMs = wakeDate.getTime() - sleepDate.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    // Calculate deviation from target wake time
    const targetWakeDate = parseTimeToDate('05:00', wakeDate);
    const deviationMinutes = calculateMinutesBetween(targetWakeDate, wakeDate);

    // Save to Firebase
    const result = await saveSleepData(userId, dayId, {
      sleepTime: Timestamp.fromDate(sleepDate),
      wakeTime: Timestamp.fromDate(wakeDate),
      durationHours,
      deviationMinutes
    });

    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Generate dummy data for new users (first 30 days)
export const generateInitialSleepData = async (userId: string): Promise<void> => {
  const today = new Date();
  const sleepTimePatterns = [
    '22:30', '22:45', '23:00', '23:15', '23:30', '21:45', '22:00', '22:15'
  ];
  const wakeTimePatterns = [
    '04:45', '05:15', '05:30', '05:45', '06:00', '04:30', '05:00', '06:15'
  ];

  const promises = [];
  for (let i = 29; i >= 0; i--) {
    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - i);
    const dateKey = currentDate.toISOString().split('T')[0];
    const sleepTimeIndex = i % sleepTimePatterns.length;
    const wakeTimeIndex = (i + 3) % wakeTimePatterns.length;
    const sleepTimeStr = sleepTimePatterns[sleepTimeIndex];
    const wakeTimeStr = wakeTimePatterns[wakeTimeIndex];
    promises.push(updateSleepData(userId, dateKey, sleepTimeStr, wakeTimeStr));
  }
  await Promise.all(promises);
};
