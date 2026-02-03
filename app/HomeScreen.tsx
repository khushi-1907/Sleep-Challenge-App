import {
    Ionicons,
    MaterialIcons
} from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

interface WeeklyData {
  day: string;
  sleepPercentage: number;
}

interface SleepDay {
  date: string;        // e.g. "Mon"
  sleepTime: Date;
  wakeTime: Date;
  durationMinutes: number;
}

interface TimelineBar {
  barStartPercent: number;
  barWidthPercent: number;
}

const mockWeeklyData: WeeklyData[] = [
  { day: 'Mon', sleepPercentage: 85 },
  { day: 'Tue', sleepPercentage: 75 },
  { day: 'Wed', sleepPercentage: 90 },
  { day: 'Thu', sleepPercentage: 70 },
  { day: 'Fri', sleepPercentage: 80 },
];

const mockDeviationData = [60, 45, 80, 55, 70, 65, 40];

// Timeline window: 10:00 PM to 6:00 AM (8 hours = 480 minutes)
const TIMELINE_START_MINUTES = 22 * 60; // 22:00 = 1320 minutes
const TIMELINE_END_MINUTES = 6 * 60;    // 06:00 = 360 minutes (next day)
const TIMELINE_DURATION = 8 * 60;       // 480 minutes total

export default function HomeScreen() {
  // State for time selection
  const [sleepTime, setSleepTime] = useState<Date | null>(null);
  const [wakeTime, setWakeTime] = useState<Date | null>(null);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [showWakePicker, setShowWakePicker] = useState(false);

  const colors = {
    primary: '#17cfcf',
    background: '#f8fafc', // slate-50 equivalent
    card: '#ffffff',
    text: '#1e293b', // slate-800 equivalent
    textSecondary: '#64748b', // slate-500 equivalent
    border: '#f1f5f9', // slate-100 equivalent
    success: '#4caf50',
    warning: '#ff9800',
    buttonPrimary: '#2563eb', // blue-600 equivalent
    buttonDisabled: '#94a3b8', // slate-400 for disabled state
  };

  // Format time for display
  const formatTime = (date: Date | null): string => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  };

  // Time picker handlers
  const onSleepTimeChange = (event: any, selectedDate?: Date) => {
    setShowSleepPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSleepTime(selectedDate);
    }
  };

  const onWakeTimeChange = (event: any, selectedDate?: Date) => {
    setShowWakePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setWakeTime(selectedDate);
    }
  };

  const handleSaveToday = () => {
    if (sleepTime && wakeTime) {
      console.log('Sleep Time:', formatTime(sleepTime));
      console.log('Wake Time:', formatTime(wakeTime));
      console.log('Full sleep date:', sleepTime.toISOString());
      console.log('Full wake date:', wakeTime.toISOString());
    }
  };

  // Web time input handlers
  const handleWebTimeChange = (timeString: string, type: 'sleep' | 'wake') => {
    const [hours, minutes] = timeString.split(':');
    const newDate = new Date();
    newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    if (type === 'sleep') {
      setSleepTime(newDate);
    } else {
      setWakeTime(newDate);
    }
  };

  // Generate weekly sleep data
  const getWeeklySleepData = (): SleepDay[] => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const todayIndex = today === 0 ? 6 : today - 1; // Convert to Mon=0, Sun=6
    
    return days.map((day, index) => {
      if (index === todayIndex && sleepTime && wakeTime) {
        // Today: use actual selected times
        const duration = Math.round((wakeTime.getTime() - sleepTime.getTime()) / (1000 * 60));
        return {
          date: day,
          sleepTime: sleepTime,
          wakeTime: wakeTime,
          durationMinutes: duration > 0 ? duration : duration + 24 * 60 // Handle overnight
        };
      } else {
        // Other days: use mock data
        const mockSleepTime = new Date();
        mockSleepTime.setHours(22 + Math.floor(Math.random() * 2), 30 + Math.floor(Math.random() * 30), 0, 0);
        
        const mockWakeTime = new Date();
        mockWakeTime.setHours(5 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
        
        // Ensure wake time is after sleep time (handle overnight)
        if (mockWakeTime <= mockSleepTime) {
          mockWakeTime.setDate(mockWakeTime.getDate() + 1);
        }
        
        const duration = Math.round((mockWakeTime.getTime() - mockSleepTime.getTime()) / (1000 * 60));
        
        return {
          date: day,
          sleepTime: mockSleepTime,
          wakeTime: mockWakeTime,
          durationMinutes: duration
        };
      }
    });
  };

  // Convert time to minutes from midnight
  const timeToMinutes = (date: Date): number => {
    return date.getHours() * 60 + date.getMinutes();
  };

  // Calculate timeline bar position and width
  const calculateTimelineBar = (sleepDay: SleepDay): TimelineBar => {
    const sleepMinutes = timeToMinutes(sleepDay.sleepTime);
    const wakeMinutes = timeToMinutes(sleepDay.wakeTime);
    
    let barStartMinutes, barEndMinutes;
    
    // Handle overnight sleep
    if (wakeMinutes < sleepMinutes) {
      // Sleep spans midnight
      if (sleepMinutes >= TIMELINE_START_MINUTES) {
        // Sleep starts after 10 PM
        barStartMinutes = Math.max(sleepMinutes, TIMELINE_START_MINUTES);
        barEndMinutes = Math.min(wakeMinutes + 24 * 60, TIMELINE_END_MINUTES + 24 * 60);
      } else {
        // Sleep starts before 10 PM - clamp to timeline start
        barStartMinutes = TIMELINE_START_MINUTES;
        barEndMinutes = Math.min(wakeMinutes + 24 * 60, TIMELINE_END_MINUTES + 24 * 60);
      }
    } else {
      // Same day sleep (shouldn't happen for normal sleep but handle anyway)
      barStartMinutes = Math.max(sleepMinutes, TIMELINE_START_MINUTES);
      barEndMinutes = Math.min(wakeMinutes, TIMELINE_END_MINUTES + 24 * 60);
    }
    
    // Convert to percentages within timeline
    let barStartPercent = ((barStartMinutes - TIMELINE_START_MINUTES) / TIMELINE_DURATION) * 100;
    let barWidthPercent = ((barEndMinutes - barStartMinutes) / TIMELINE_DURATION) * 100;
    
    // Clamp values to prevent layout issues
    barStartPercent = Math.max(0, Math.min(100, barStartPercent));
    barWidthPercent = Math.max(0, Math.min(100 - barStartPercent, barWidthPercent));
    
    return {
      barStartPercent,
      barWidthPercent
    };
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingBottom: 100, // Space for bottom nav
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 20,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700', // Increased weight
      color: colors.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      opacity: 0.7, // Slightly muted
    },
    welcomeText: {
      fontSize: 14,
      color: colors.success,
      fontStyle: 'italic',
      marginTop: 4,
    },
    headerRight: {
      flexDirection: 'row',
      gap: 16,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    section: {
      paddingHorizontal: 20,
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    timeCardsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    timeCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    timeCardLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    timeCardIcon: {
      marginBottom: 12,
    },
    timeCardHelper: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 4,
      fontStyle: 'italic',
    },
    timeCardTime: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    timeCardPlaceholder: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.textSecondary,
      opacity: 0.5,
    },
    saveButton: {
      backgroundColor: sleepTime && wakeTime ? colors.buttonPrimary : colors.buttonDisabled,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
      opacity: sleepTime && wakeTime ? 1 : 0.6,
    },
    saveButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    timelineCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    timelineHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    timelineTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    timelineBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    timelineBadgeText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '600',
    },
    timelineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    timelineRowCurrent: {
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    timelineDay: {
      width: 40,
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    timelineBarContainer: {
      flex: 1,
      height: 24,
      backgroundColor: '#f1f5f9',
      borderRadius: 12,
      marginLeft: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    timelineBar: {
      position: 'absolute',
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 12,
    },
    timelineBarToday: {
      backgroundColor: colors.buttonPrimary,
      height: '100%',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.buttonPrimary,
    },
    timelineLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    timelineLabel: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    deviationCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    deviationHeader: {
      marginBottom: 20,
    },
    deviationTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    deviationMain: {
      alignItems: 'center',
      marginBottom: 16,
    },
    deviationNumber: {
      fontSize: 48,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    deviationSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    deviationHelper: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 8,
    },
    deviationBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    deviationBadgeText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '600',
    },
    deviationChart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 80,
      paddingHorizontal: 8,
    },
    deviationBar: {
      width: 20,
      backgroundColor: colors.primary,
      borderRadius: 4,
      position: 'relative',
    },
    deviationBarToday: {
      backgroundColor: colors.warning,
    },
    deviationBaseline: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: colors.textSecondary,
      top: '50%',
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: colors.textSecondary,
    },
    bottomNav: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: 'row',
      paddingBottom: 8,
      paddingTop: 12,
    },
    navTab: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
    },
    navTabActive: {
      // Active tab styling
    },
    navIcon: {
      fontSize: 24,
    },
    navIconActive: {
      color: colors.primary,
    },
    navIconInactive: {
      color: colors.textSecondary,
    },
    navLabel: {
      fontSize: 11,
    },
    navLabelActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    navLabelInactive: {
      color: colors.textSecondary,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* TOP APP BAR */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>5 AM Challenge</Text>
            <Text style={styles.headerSubtitle}>Tuesday, Oct 24</Text>
            <Text style={styles.welcomeText}>Welcome back 👋</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable 
              style={styles.iconButton}
              onPress={() => console.log('Calendar pressed')}
            >
              <Ionicons 
                name="calendar-outline" 
                size={20} 
                color={colors.textSecondary} 
              />
            </Pressable>
            <Pressable 
              style={styles.iconButton}
              onPress={() => console.log('Settings pressed')}
            >
              <Ionicons 
                name="settings-outline" 
                size={20} 
                color={colors.textSecondary} 
              />
            </Pressable>
          </View>
        </View>

        {/* TODAY'S ENTRY SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Entry</Text>
          <View style={styles.timeCardsContainer}>
            {Platform.OS === 'web' ? (
              // Web: Use HTML time input
              <View style={styles.timeCard}>
                <Text style={styles.timeCardLabel}>Sleep Time</Text>
                <View style={styles.timeCardIcon}>
                  <MaterialIcons name="bedtime" size={32} color={colors.primary} />
                </View>
                <input
                  type="time"
                  value={sleepTime ? formatTime(sleepTime) : ''}
                  onChange={(e) => handleWebTimeChange(e.target.value, 'sleep')}
                  style={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: colors.text,
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'center',
                    outline: 'none',
                    width: '100%'
                  }}
                />
                <Text style={styles.timeCardHelper}>Set sleep time</Text>
              </View>
            ) : (
              // Mobile: Use pressable card with DateTimePicker
              <Pressable 
                style={styles.timeCard}
                onPress={() => setShowSleepPicker(true)}
              >
                <Text style={styles.timeCardLabel}>Sleep Time</Text>
                <View style={styles.timeCardIcon}>
                  <MaterialIcons name="bedtime" size={32} color={colors.primary} />
                </View>
                <Text style={sleepTime ? styles.timeCardTime : styles.timeCardPlaceholder}>
                  {formatTime(sleepTime)}
                </Text>
                <Text style={styles.timeCardHelper}>Tap to set time</Text>
              </Pressable>
            )}

            {Platform.OS === 'web' ? (
              // Web: Use HTML time input
              <View style={styles.timeCard}>
                <Text style={styles.timeCardLabel}>Wake-Up Time</Text>
                <View style={styles.timeCardIcon}>
                  <Ionicons name="sunny-outline" size={32} color={colors.primary} />
                </View>
                <input
                  type="time"
                  value={wakeTime ? formatTime(wakeTime) : ''}
                  onChange={(e) => handleWebTimeChange(e.target.value, 'wake')}
                  style={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: colors.text,
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'center',
                    outline: 'none',
                    width: '100%'
                  }}
                />
                <Text style={styles.timeCardHelper}>Set wake time</Text>
              </View>
            ) : (
              // Mobile: Use pressable card with DateTimePicker
              <Pressable 
                style={styles.timeCard}
                onPress={() => setShowWakePicker(true)}
              >
                <Text style={styles.timeCardLabel}>Wake-Up Time</Text>
                <View style={styles.timeCardIcon}>
                  <Ionicons name="sunny-outline" size={32} color={colors.primary} />
                </View>
                <Text style={wakeTime ? styles.timeCardTime : styles.timeCardPlaceholder}>
                  {formatTime(wakeTime)}
                </Text>
                <Text style={styles.timeCardHelper}>Tap to set time</Text>
              </Pressable>
            )}
          </View>
          <Pressable 
            style={styles.saveButton}
            onPress={handleSaveToday}
            disabled={!sleepTime || !wakeTime}
          >
            <Text style={styles.saveButtonText}>Save Today</Text>
          </Pressable>
        </View>

        {/* WEEKLY SLEEP TIMELINE */}
        <View style={styles.section}>
          <View style={styles.timelineCard}>
            <View style={styles.timelineHeader}>
              <Text style={styles.timelineTitle}>Weekly Sleep Timeline</Text>
              <View style={styles.timelineBadge}>
                <Text style={styles.timelineBadgeText}>
                  Avg: {Math.round(getWeeklySleepData().reduce((acc, day) => acc + day.durationMinutes, 0) / 7 / 60 * 60) / 60}h {Math.round(getWeeklySleepData().reduce((acc, day) => acc + day.durationMinutes, 0) / 7 % 60)}m
                </Text>
              </View>
            </View>
            
            {getWeeklySleepData().map((sleepDay, index) => {
              const today = new Date().getDay();
              const todayIndex = today === 0 ? 6 : today - 1;
              const isToday = index === todayIndex;
              const timelineBar = calculateTimelineBar(sleepDay);
              
              return (
                <View 
                  key={index} 
                  style={[
                    styles.timelineRow,
                    isToday && styles.timelineRowCurrent
                  ]}
                >
                  <Text style={styles.timelineDay}>{sleepDay.date}</Text>
                  <View style={styles.timelineBarContainer}>
                    <View 
                      style={[
                        isToday ? styles.timelineBarToday : styles.timelineBar,
                        {
                          left: `${timelineBar.barStartPercent}%`,
                          width: `${timelineBar.barWidthPercent}%`
                        }
                      ]} 
                    />
                  </View>
                </View>
              );
            })}
            
            <View style={styles.timelineLabels}>
              <Text style={styles.timelineLabel}>10 PM</Text>
              <Text style={styles.timelineLabel}>12 AM</Text>
              <Text style={styles.timelineLabel}>02 AM</Text>
              <Text style={styles.timelineLabel}>04 AM</Text>
              <Text style={styles.timelineLabel}>06 AM</Text>
            </View>
          </View>
        </View>

        {/* WAKE-UP DEVIATION SECTION */}
        <View style={styles.section}>
          <View style={styles.deviationCard}>
            <View style={styles.deviationHeader}>
              <Text style={styles.deviationTitle}>Wake-Up Deviation</Text>
            </View>
            
            <View style={styles.deviationMain}>
              <Text style={styles.deviationNumber}>-4m</Text>
              <Text style={styles.deviationSubtitle}>vs 5:00 AM Target</Text>
              <View style={styles.deviationBadge}>
                <Text style={styles.deviationBadgeText}>On Track</Text>
              </View>
              <Text style={styles.deviationHelper}>Trend improves as you wake closer to target</Text>
            </View>
            
            <View style={styles.deviationChart}>
              <View style={styles.deviationBaseline} />
              {mockDeviationData.map((height, index) => (
                <View
                  key={index}
                  style={[
                    styles.deviationBar,
                    { height: `${height}%` },
                    index === mockDeviationData.length - 1 && styles.deviationBarToday
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <Pressable 
          style={styles.navTab}
          onPress={() => console.log('Home tab pressed')}
        >
          <Ionicons 
            name="home" 
            style={[styles.navIcon, styles.navIconActive]} 
          />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </Pressable>
        
        <Pressable 
          style={styles.navTab}
          onPress={() => console.log('Analytics tab pressed')}
        >
          <Ionicons 
            name="bar-chart-outline" 
            style={[styles.navIcon, styles.navIconInactive]} 
          />
          <Text style={[styles.navLabel, styles.navLabelInactive]}>Analytics</Text>
        </Pressable>
        
        <Pressable 
          style={styles.navTab}
          onPress={() => console.log('Club tab pressed')}
        >
          <Ionicons 
            name="people-outline" 
            style={[styles.navIcon, styles.navIconInactive]} 
          />
          <Text style={[styles.navLabel, styles.navLabelInactive]}>Club</Text>
        </Pressable>
        
        <Pressable 
          style={styles.navTab}
          onPress={() => console.log('Nudge tab pressed')}
        >
          <Ionicons 
            name="notifications-outline" 
            style={[styles.navIcon, styles.navIconInactive]} 
          />
          <Text style={[styles.navLabel, styles.navLabelInactive]}>Nudge</Text>
        </Pressable>
      </View>

      {/* TIME PICKERS - Only for mobile platforms */}
      {Platform.OS !== 'web' && showSleepPicker && (
        <DateTimePicker
          value={sleepTime || new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onSleepTimeChange}
        />
      )}

      {Platform.OS !== 'web' && showWakePicker && (
        <DateTimePicker
          value={wakeTime || new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onWakeTimeChange}
        />
      )}
    </SafeAreaView>
  );
}
