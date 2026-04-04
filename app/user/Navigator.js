import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { COLOURS } from '../../constants/theme'
import Home from './Home'
import Map from './Map'
import AddPost from './AddPost'
import GuardianNavigator from '../guardian/Navigator'
import Profile from './Profile'

const Tab = createBottomTabNavigator()

export default function UserNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                // Hides the default header on all tab screens
                headerShown: false,

                // The colour of the active tab icon and label
                tabBarActiveTintColor: COLOURS.primary,

                // The colour of inactive tab icons and labels
                tabBarInactiveTintColor: COLOURS.textGrey,

                // The background colour of the tab bar at the bottom
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: COLOURS.border,
                    borderTopWidth: 1,
                },

                // The font size of the tab labels
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="home" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Map"
                component={Map}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="map" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Add Post"
                component={AddPost}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="plus-circle" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Guardians"
                component={GuardianNavigator}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="shield-account" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account" size={24} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    )
}