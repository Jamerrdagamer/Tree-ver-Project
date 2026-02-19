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
          title: 'The Grove',
          tabBarIcon: ({ color, size }) => <Ionicons name="leaf" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Sacred Trees',
          tabBarIcon: ({ color, size }) => <Ionicons name="flower" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="rituals"
        options={{
          title: 'Rituals',
          tabBarIcon: ({ color, size }) => <Ionicons name="flame" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="doctrine"
        options={{
          title: 'Teachings',
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
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
