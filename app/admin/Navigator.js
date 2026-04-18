import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import Trees from './Trees'
import Users from './Users'
import Applications from './Applications'
import Posts from './Posts'
import Profile from './Profile'

const Tab = createBottomTabNavigator()

const ADMIN_BLUE = '#1B2A6B'
const GREY = '#555555'
const BORDER = '#E0E0E0'

export default function AdminNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: ADMIN_BLUE,
                tabBarInactiveTintColor: GREY,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: BORDER,
                    borderTopWidth: 1,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Trees"
                component={Trees}
                options={{
                    tabBarLabel: 'Trees',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="tree" size={24} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Users"
                component={Users}
                options={{
                    tabBarLabel: 'Users',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account-group" size={24} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Applications"
                component={Applications}
                options={{
                    tabBarLabel: 'Applications',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="clipboard-list" size={24} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Posts"
                component={Posts}
                options={{
                    tabBarLabel: 'Posts',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="image-multiple" size={24} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account-cog" size={24} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    )
}