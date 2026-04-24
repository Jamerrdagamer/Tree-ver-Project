import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { ADMIN_COLOURS as ADMIN } from '../../constants/theme'

export default function Profile({ navigation }) {

    const [profileLoading, setProfileLoading] = useState(true)
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')

    useEffect(() => {
        getAdminProfile()
    }, [])

    async function getAdminProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setProfileLoading(false)
                return
            }

            setEmail(user.email || '')

            const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single()

            if (profile) {
                setUsername(profile.username || '')
            }

        } catch (err) {
            console.log('Error loading admin profile:', err)
        }

        setProfileLoading(false)
    }

    async function handleLogout() {
        await supabase.auth.signOut()

        navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
        })
    }

    if (profileLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ADMIN.primary} />
            </View>
        )
    }

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin Profile</Text>
                <Text style={styles.headerSubtitle}>
                    Your admin account
                </Text>
            </View>

            <View style={styles.adminBadgeRow}>
                <View style={styles.adminIconCircle}>
                    <MaterialCommunityIcons
                        name="shield-crown"
                        size={32}
                        color={ADMIN.primary}
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.adminName}>
                        {username || 'Admin'}
                    </Text>

                    <Text style={styles.adminEmail}>
                        {email}
                    </Text>

                    <Text style={styles.adminRole}>
                        Administrator
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <MaterialCommunityIcons
                        name="logout"
                        size={24}
                        color={ADMIN.error}
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.bigLogoutButton}
                onPress={handleLogout}
            >
                <MaterialCommunityIcons
                    name="logout"
                    size={20}
                    color="#FFFFFF"
                />

                <Text style={styles.bigLogoutText}>
                    Log Out
                </Text>
            </TouchableOpacity>
        </ScrollView>
    )
}