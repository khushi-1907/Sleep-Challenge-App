export interface DashboardDay {
  id: string;
  date: string; // ISO string
  dayLabel: string; // Mon, Tue, etc.
  dateLabel: string; // Feb 3
  sleepTime: string; // HH:mm
  wakeTime: string; // HH:mm
  sleepMinutes: number;
  targetWakeTime: string; // HH:mm, default "05:00"
  deviationMinutes: number; // wakeTime - targetWakeTime
  isToday: boolean;
  isFuture: boolean;
}

// Helper function to format time as HH:mm (local time)
export const formatTimeHHmm = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Helper function to get day label
export const getDayLabel = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

// Helper function to calculate minutes between two times
export const calculateMinutesBetween = (startTime: Date, endTime: Date): number => {
  return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
};

// Helper function to parse HH:mm to Date object
export const parseTimeToDate = (timeStr: string, baseDate: Date): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

// Helper function to add days to a date
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Deterministic dummy data patterns
const sleepTimePatterns = [
  '22:30', '22:45', '23:00', '23:15', '23:30', '21:45', '22:00', '22:15'
];

const wakeTimePatterns = [
  '04:45', '05:15', '05:30', '05:45', '06:00', '04:30', '05:00', '06:15'
];

export function getDummyDashboardData(): DashboardDay[] {
  const data: DashboardDay[] = [];
  const today = new Date();
  const targetWakeTime = '05:00';

  // Generate 46 days of data (30 past, today, 15 future)
  for (let i = 30; i >= -15; i--) {
    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - i);

    const isToday = i === 0;
    const isFuture = i < 0;

    // Use deterministic patterns based on day index for consistent data
    const sleepTimeIndex = ((i % sleepTimePatterns.length) + sleepTimePatterns.length) % sleepTimePatterns.length;
    const wakeTimeIndex = (((i + 3) % wakeTimePatterns.length) + wakeTimePatterns.length) % wakeTimePatterns.length;

    const sleepTimeStr = sleepTimePatterns[sleepTimeIndex];
    const wakeTimeStr = wakeTimePatterns[wakeTimeIndex];

    // Parse times to Date objects for calculations
    const sleepDate = parseTimeToDate(sleepTimeStr, currentDate);
    let wakeDate = parseTimeToDate(wakeTimeStr, currentDate);

    // Handle sleep crossing midnight
    if (wakeDate <= sleepDate) {
      wakeDate = addDays(wakeDate, 1);
    }

    // Calculate sleep minutes
    const sleepMinutes = calculateMinutesBetween(sleepDate, wakeDate);

    // Calculate deviation from target wake time
    const targetWakeDate = parseTimeToDate(targetWakeTime, wakeDate);
    const deviationMinutes = calculateMinutesBetween(targetWakeDate, wakeDate);

    const dayEntry: DashboardDay = {
      id: `day-${i}`,
      date: currentDate.toISOString(),
      dayLabel: getDayLabel(currentDate),
      dateLabel: currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      sleepTime: sleepTimeStr,
      wakeTime: wakeTimeStr,
      sleepMinutes,
      targetWakeTime,
      deviationMinutes,
      isToday,
      isFuture
    };

    data.push(dayEntry);
  }

  return data;
}
