import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BarChart3, Bell, MoonStar, Users } from 'lucide-react-native';
import { Platform, View } from 'react-native';
import AnalyticsScreen from './analytics';
import ClubScreen from './club';
import HomeScreen from './home';
import NudgeScreen from './nudge';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 85 : 70,
          borderRadius: 0,
          ...Platform.select({
            web: {
              boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.05)',
            } as any,
            default: {
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: -2,
              },
              shadowOpacity: 0.05,
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
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#94a3b8',
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
                backgroundColor: focused ? '#eff6ff' : 'transparent',
                borderRadius: 12,
                padding: 8,
              }}
            >
              <IconComponent size={22} strokeWidth={1.8} color={focused ? '#3b82f6' : '#94a3b8'} />
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

