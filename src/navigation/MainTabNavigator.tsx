import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/hooks/useTheme';
import MissingItemsScreen from '@/screens/MissingItemsScreen';
import DatabaseScreen from '@/screens/DatabaseScreen';
import OrdersScreen from '@/screens/OrdersScreen';
import { getCommonScreenOptions } from '@/navigation/screenOptions';
import { Spacing } from '@/constants/theme';
import { HeaderTitle } from '@/components/HeaderTitle';
import { HomeIcon, DatabaseIcon, OrdersIcon } from '@/shared/icons';

export type MainTabParamList = {
  Home: undefined;
  Database: undefined;
  Orders: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        ...getCommonScreenOptions({ theme }),
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: theme.tabBar,
          borderTopWidth: 0,
          elevation: 0,
          height: Spacing.tabBarHeight,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '400',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={MissingItemsScreen}
        options={{
          title: 'Home',
          headerTitle: () => <HeaderTitle title="Barnode" />,
          tabBarIcon: ({ color }) => <HomeIcon color={color} size={22} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Database"
        component={DatabaseScreen}
        options={{
          title: 'Database',
          headerTitle: () => <HeaderTitle title="Barnode" />,
          tabBarIcon: ({ color }) => <DatabaseIcon color={color} size={22} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: 'Ordini',
          headerTitle: () => <HeaderTitle title="Barnode" />,
          tabBarIcon: ({ color }) => <OrdersIcon color={color} size={22} strokeWidth={2} />,
        }}
      />
    </Tab.Navigator>
  );
}
