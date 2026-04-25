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

// Styles for admin content management
const styles = StyleSheet.create({

    // Full-screen loading state container
    loadingContainer: {
        flex: 1, //
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ADMIN.backgroundSecondary, // Secondary background colour
    },

    // Main screen wrapper
    container: {
        flex: 1,
        backgroundColor: ADMIN.backgroundSecondary, // Main background colour
    },

    // Main section at the top of the screen
    header:
        { backgroundColor: ADMIN.primary, // Primary theme colour
        paddingTop: 56, // Safe for status bar/safe area
            paddingBottom: 20,
            paddingHorizontal: 16,
        },

    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF', // White text
        marginBottom: 4,
    },

    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)', // Semi-transparent white
    },

    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF', // White background
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 12, // Rounded container corners
        padding: 6, // Inner spacing
        gap: 6,
        elevation: 2,// Android shadow
        shadowColor: '#000000', // iOS shadow colour
        shadowOffset: { width: 0, height: 1 }, // Shadow direction
        shadowOpacity: 0.08,  // Shadow transparency
        shadowRadius: 4, // Shadow blur
    },

    // Individual toogle buttons
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center', // Vertical alignment
        justifyContent: 'center', // Horizontal alignment
        borderRadius: 8,
        paddingVertical: 10, // Vertical button spacing
        gap: 6,
    },

    // Active toggle button
    toggleButtonActive: {
        backgroundColor: ADMIN.primary, // Highlight active tab
    },

    // Inactive toggle button
    toggleButtonInactive: {
        backgroundColor: 'transparent', // Transparent background
    },

    // Base text styling for toggle buttons
    toggleButtonText: {
        fontWeight: '600', // Semi-bold text
        fontSize: 14,
    },

    // Text colour for active toggle state
    toggleButtonTextActive: {
        color: '#FFFFFF', // White text
    },

    // Text colour for inactive toggle state
    toggleButtonTextInactive: {
        color: ADMIN.primary, // Primary theme colour
    },

    // FlatList content spacing
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 24,
    },

    // Space between list items/cards
    separator: {
        height: 12
    },

    // Main content card container
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        overflow: 'hidden',  // Prevent children overflow
        elevation: 2, //Android shadow
        shadowColor: '#000000', // iOS shadow colour
        shadowOffset: { width: 0, height: 1 }, // Shadow direction
        shadowOpacity: 0.08, // Shadow transparency
        shadowRadius: 4, // Shadow blur
    },

    // Image displayed at the top of the card
    cardImage: { width: '100%', // Full card width
        height: 180, // Fixed image height
    },

    // Floating delete button image/card
    deleteButton: {
        position: 'absolute', // Overlay positioning
        top: 10, // Distance from top
        right: 10, // Distance from right
        backgroundColor: 'rgba(231, 76, 60, 0.85)', // Semi-transparent red
        borderRadius: 8, // Rounded corners
        padding: 8, // Inner spacing
    },

    // Inner card content wrapper
    cardContent: {
        padding: 14 }, // Content spacing

    guardianBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: ADMIN.primaryLight,
        borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
        gap: 4, marginBottom: 10,
    },

    // Text inside guardian badge
    guardianBadgeText: { fontSize: 12,
        color: ADMIN.primary, //Primary theme colour
        fontWeight: '600', // Semi-bold text
    },

    // Row displaying metadata/info
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },

    // Metadata/info text styling
    infoText: {
        fontSize: 13,
        color: ADMIN.textGrey, // Grey text colour
    },

    // Main caption/ body text
    caption: {
        fontSize: 14,
        color: ADMIN.textDark,
        lineHeight: 20, // Better readability
        marginBottom: 10, // Bottom spacing
    },

    // Wrapper for tags/chips
    tagsRow: {
        flexDirection: 'row',// Horizontal layout
        flexWrap: 'wrap', // Allow multiple rows
        gap: 6, // Space between tags
        marginBottom: 10,
    },

    // Individual tag/chip container
    tag: {
        borderRadius: 999, // Pill shape
        paddingHorizontal: 10,
        paddingVertical: 4,
    },

    // Text inside tag/chip
    tagText: {
        fontSize: 12,
        fontWeight: '600', // Semi-bold text
    },

    // Footer metadata row
    footerRow: {
        flexDirection: 'row', // Horizontal layout
        flexWrap: 'wrap', // Wrap if needed
        gap: 12,// Space between footer items
    },

    // Individual footer item container
    footerItem: {
        flexDirection: 'row', // Places icon and text side-by-side
        alignItems: 'center', // Vertically aligns icon and text
        gap: 4, // Space between icon and text
    },

    //Footer text styling
    footerText: {
        fontSize: 12,
        color: ADMIN.textLight,
    },

    // Empty state container shown when no data/content exists
    emptyState: {
        alignItems: 'center',
        paddingTop: 80,
        paddingHorizontal: 32,
    },

    // Title text displayed in the empty state
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: ADMIN.textDark,
        marginTop: 16,
    },

})