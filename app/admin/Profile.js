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

// Creates a stylesheet for the admin screen
const styles = StyleSheet.create({

    // Full-screen loading container
    loadingContainer: {
        flex: 1,
        alignItems: 'center', // Centers content horizontally
        justifyContent: 'center', // Centers content vertically
        backgroundColor: ADMIN.backgroundSecondary,
    },

    // Main scrollable screen background
    scrollView: {
        backgroundColor: ADMIN.backgroundSecondary,
    },

    // Padding for scrollable content
    scrollContent: {
        paddingBottom: 40,
    },

    // Top header section styling
    header: {
        backgroundColor: ADMIN.primary,
        paddingTop: 56,
        paddingBottom: 20,
        paddingHorizontal: 16,
    },

    // Main title inside the header
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },

    // Subtitle text below the header title
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
    },

    // Card displaying admin profile information
    adminBadgeRow: {
        flexDirection: 'row', // Horizontal layout
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 14,
        padding: 16,
        gap: 14,
        elevation: 2,  // Android shadow
        shadowColor: '#000000', // iOS shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },

    // Circular background for admin icon/avatar
    adminIconCircle: {
        backgroundColor: ADMIN.primaryLight,
        width: 60,
        height: 60,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Admin name text styling
    adminName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: ADMIN.textDark,
        marginBottom: 2,
    },

    // Admin email text styling
    adminEmail: {
        fontSize: 13,
        color: ADMIN.textGrey,
        marginBottom: 3,
    },

    // Admin role badge/text styling
    adminRole: {
        fontSize: 13,
        color: ADMIN.primary,
        fontWeight: '600',
    },

    // Small logout icon button
    logoutButton: {
        padding: 4,
    },

    // Large logout button container
    bigLogoutButton: {
        flexDirection: 'row',  // Icon and text side-by-side
        alignItems: 'centre',
        justifyContent: 'centre',
        backgroundColor: ADMIN.error,
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 10,
        paddingVertical: 14,
        gap: 8,
    },

    // Text displayed inside the logout button
    bigLogoutText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },

})