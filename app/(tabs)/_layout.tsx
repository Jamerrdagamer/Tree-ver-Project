/*
_layout.tsx - Tab Layout for Tree-ver App
Author: JH

1.00 JH Initial release with basic tab navigation and icons.
*/


import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#1b3d2f' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarStyle: { backgroundColor: '#102a1f', borderTopColor: '#1f4d3a' },
        tabBarActiveTintColor: '#6ee7b7',
        tabBarInactiveTintColor: '#4b7c67',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tree-ver',
          tabBarIcon: ({ color, size }) => <Ionicons name="leaf" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Our Trees',
          tabBarIcon: ({ color, size }) => <Ionicons name="flower" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="members"
        options={{
          title: 'Members',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
  name="swipe"
  options={{
    title: 'Swipe Trees',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="shuffle" size={size} color={color} />
    ),
  }}
/>


      {/* 🌱 New Adoption Tab */}
      <Tabs.Screen
        name="adoption"
        options={{
          title: 'Adoption',
          tabBarIcon: ({ color, size }) => <Ionicons name="hand-left" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
