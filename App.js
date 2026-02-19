import React, { useState, useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { supabase } from './lib/supabase'
import { COLOURS } from './constants/theme'
import AuthNavigator from './app/auth/Navigator'
import UserNavigator from './app/user/Navigator'
import AdminNavigator from './app/admin/Navigator'

const Stack = createNativeStackNavigator()

export default function App() {

  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()

    // Listen for login/logout events and re-route automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setSession(session)
          if (session) {
            await checkAdminStatus(session.user.id)
          } else {
            setIsAdmin(false)
          }
        }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function checkSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)

      if (session) {
        await checkAdminStatus(session.user.id)
      }

    } catch (err) {
      console.error('Error checking session:', err)
    } finally {
      setLoading(false)
    }
  }

  async function checkAdminStatus(userId) {
    try {
      const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', userId)
          .single()

      if (profile) {
        setIsAdmin(profile.is_admin)
      }
    } catch (err) {
      setIsAdmin(false)
    }
  }

  if (loading) {
    return (
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="large" color={COLOURS.primary} />
        </View>
    )
  }

  return (
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {session ? (
                isAdmin ? (
                    <Stack.Screen name="AdminApp" component={AdminNavigator} />
                ) : (
                    <Stack.Screen name="UserApp" component={UserNavigator} />
                )
            ) : (
                <Stack.Screen name="Auth" component={AuthNavigator} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
  )
}

// Styles used for the loading screen component
const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1, // Makes the container take up the full screen
    alignItems: 'center', //Centres child elements horizontally
    justifyContent: 'center', // Centers child elements vertically
    backgroundColor: COLOURS.background, // Sets the background colour using the theme colours
  },
})

