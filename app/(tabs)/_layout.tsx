import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BarChart3, Bell, MoonStar, Users } from 'lucide-react-native';
import { Platform, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import AnalyticsScreen from './analytics';
import ClubScreen from './club';
import HomeScreen from './home';
import NudgeScreen from './nudge';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 85 : 70,
          borderRadius: 0,
          ...Platform.select({
            web: {
              boxShadow: isDark ? '0 -2px 10px rgba(0, 0, 0, 0.3)' : '0 -2px 4px rgba(0, 0, 0, 0.05)',
            } as any,
            default: {
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: -2,
              },
              shadowOpacity: isDark ? 0.2 : 0.05,
              shadowRadius: 4,
              elevation: 5,
            },
          }),
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 2,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;

          if (route.name === 'home') {
            IconComponent = MoonStar;
          } else if (route.name === 'club') {
            IconComponent = Users;
          } else if (route.name === 'analytics') {
            IconComponent = BarChart3;
          } else if (route.name === 'nudge') {
            IconComponent = Bell;
          } else {
            IconComponent = MoonStar;
          }

          return (
            <View
              style={{
                backgroundColor: focused ? (isDark ? 'rgba(0, 229, 255, 0.1)' : 'rgba(0, 229, 255, 0.05)') : 'transparent',
                borderRadius: 12,
                padding: 8,
              }}
            >
              <IconComponent size={22} strokeWidth={1.8} color={focused ? theme.primary : theme.textSecondary} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="club"
        component={ClubScreen}
        options={{
          tabBarLabel: 'Club',
        }}
      />
      <Tab.Screen
        name="analytics"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
        }}
      />
      <Tab.Screen
        name="nudge"
        component={NudgeScreen}
        options={{
          tabBarLabel: 'Nudge',
        }}
      />
    </Tab.Navigator>
  );
}

