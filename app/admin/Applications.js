import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { ADMIN_COLOURS as ADMIN } from '../../constants/theme'

export default function Applications() {

    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const isFocused = useIsFocused()

  
    useEffect(() => {
        if (isFocused) {
            fetchApplications()
        }
    }, [isFocused])

    async function fetchApplications() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('guardian_applications')
                .select(`
                    *,
                    profiles:user_id (
                        username
                    )
                `)
                .order('applied_at', { ascending: false })

            if (error) {
                console.log('Error fetching applications:', error)
                return
            }

            setApplications(data || [])

        } catch (err) {
            console.log('Error:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleApprove(application) {
        try {
 
            const { error: appError } = await supabase
                .from('guardian_applications')
                .update({
                    status: 'approved',
                    decided_at: new Date().toISOString(),
                })
                .eq('id', application.id)

            if (appError) {
                console.log('Approve application error:', appError)
                return
            }

     
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ guardian_status: 'approved' })
                .eq('id', application.user_id)

            if (profileError) {
                console.log('Approve profile error:', profileError)
                return
            }

            // Update local state so the UI reflects the change immediately
            setApplications(current =>
                current.map(app =>
                    app.id === application.id
                        ? { ...app, status: 'approved' }
                        : app
                )
            )

        } catch (err) {
            console.log('Error approving application:', err)
        }
    }

    async function handleReject(application) {
        try {
            // Set retry date to 7 days from now
            const retryDate = new Date()
            retryDate.setDate(retryDate.getDate() + 7)

          
    
            const { error: appError } = await supabase
                .from('guardian_applications')
                .update({
                    status: 'rejected',
                    decided_at: new Date().toISOString(),
                })
                .eq('id', application.id)

            if (appError) {
                console.log('Reject application error:', appError)
                return
            }

  
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    guardian_status: 'rejected',
                    guardian_retry_date: retryDate.toISOString(),
                })
                .eq('id', application.user_id)

            if (profileError) {
                console.log('Reject profile error:', profileError)
                return
            }

  
            setApplications(current =>
                current.map(app =>
                    app.id === application.id
                        ? { ...app, status: 'rejected' }
                        : app
                )
            )

        } catch (err) {
            console.log('Error rejecting application:', err)
        }
    }

    function getStatusStyle(status) {
        if (status === 'approved') {
            return { background: '#D4EDDA', text: '#155724' }
        } else if (status === 'rejected') {
            return { background: '#F8D7DA', text: '#721C24' }
        } else {
            return { background: '#FFF3CD', text: '#856404' }
        }
    }

    function renderApplication({ item }) {
        const statusStyle = getStatusStyle(item.status)

        return (
            <View style={styles.card}>

                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <Text style={styles.username}>
                            {item.profiles?.username || 'Unknown'}
                        </Text>
                        <Text style={styles.email}>
                            User ID: {item.user_id}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.background }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                    </View>
                </View>

                <View style={styles.reasonBox}>
                    <Text style={styles.reasonLabel}>Reason</Text>
                    <Text style={styles.reasonText}>{item.reason}</Text>
                </View>

                <View style={styles.confirmationsRow}>
                    <View style={styles.confirmationItem}>
                        <MaterialCommunityIcons
                            name={item.responsibility_confirmed ? 'checkbox-marked' : 'checkbox-blank-outline'}
                            size={18}
                            color={item.responsibility_confirmed ? ADMIN.success : ADMIN.error}
                        />
                        <Text style={styles.confirmationText}>Responsibility confirmed</Text>
                    </View>
                    <View style={styles.confirmationItem}>
                        <MaterialCommunityIcons
                            name={item.over_16_confirmed ? 'checkbox-marked' : 'checkbox-blank-outline'}
                            size={18}
                            color={item.over_16_confirmed ? ADMIN.success : ADMIN.error}
                        />
                        <Text style={styles.confirmationText}>Over 16 confirmed</Text>
                    </View>
                </View>

                <View style={styles.dateRow}>
                    <MaterialCommunityIcons name="calendar" size={15} color={ADMIN.textLight} />
                    <Text style={styles.dateText}>
                        Applied {new Date(item.applied_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    })}
                    </Text>
                </View>

                {item.status === 'pending' ? (
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.approveButton}
                            onPress={() => handleApprove(item)}
                        >
                            <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                            <Text style={styles.approveButtonText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.rejectButton}
                            onPress={() => handleReject(item)}
                        >
                            <MaterialCommunityIcons name="close" size={16} color={ADMIN.error} />
                            <Text style={styles.rejectButtonText}>Reject</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

            </View>
        )
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ADMIN.primary} />
            </View>
        )
    }

    const pendingCount = applications.filter(a => a.status === 'pending').length

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Guardian Applications</Text>
                    {pendingCount > 0 ? (
                        <View style={styles.pendingBadge}>
                            <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
                        </View>
                    ) : null}
                </View>
                <Text style={styles.headerSubtitle}>
                    Review and manage guardian applications
                </Text>
            </View>

            <FlatList
                data={applications}
                keyExtractor={item => item.id}
                renderItem={renderApplication}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons
                            name="clipboard-list"
                            size={64}
                            color={ADMIN.textLight}
                        />
                        <Text style={styles.emptyTitle}>No applications yet</Text>
                        <Text style={styles.emptyMessage}>
                            Guardian applications will appear here when users apply.
                        </Text>
                    </View>
                )}
            />

        </View>
    )
}


// Defines all styles used throughout the admin approval screen
const styles = StyleSheet.create({

    // Full-screen centered loading state container
    loadingContainer: {
        flex: 1, // Takes up full screen
        alignItems: 'center', // Centers content horizontally
        justifyContent: 'center', // Centers content vertically
        backgroundColor: ADMIN.backgroundSecondary, // Secondary backgorund colour
    },

    // Main screen wrapper
    container: {
        flex: 1, // Takes up full avaliable space
        backgroundColor: ADMIN.backgroundSecondary, // Screen background colour
    },

    // Top header section styling
    header: {
        backgroundColor: ADMIN.primary, // Primary brand colour
        paddingTop: 56, // Space from top safe area
        paddingBottom: 20, // Bottom spacing
        paddingHorizontal: 16, // Horizontal padding
    },

    // Row layout inside header
    headerRow: {
        flexDirection: 'row', // Places items side by side
        alignItems: 'center', // Vertically aligns items
        gap: 10, // Space between row items
        marginBottom: 4, // Spacing below row
    },

    // Main title text in header
    headerTitle: {
        fontSize: 22, // Large title size
        fontWeight: 'bold', // Bold font styling
        color: '#FFFFFF', // White text
    },

    // Badge showing pending count/status
    pendingBadge: {
        backgroundColor: ADMIN.warning, // Warning highlight colour
        borderRadius: 999, // Fully rounded badge
        paddingHorizontal: 8, // Horizontal spacing
        paddingVertical: 2, // Vertical spacing
    },

    // Text inside pending badge
    pendingBadgeText: {
        color: '#FFFFFF', // White text
        fontWeight: 'bold', // bold text
        fontSize: 13, // Small badge text
    },


    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)', // Semi-transparent white
    },

    // FlatList content container spacing
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
    },

    // Spacer between cards/items
    separator: {
        height: 12,
    },

    // Approval request card container spacing
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14, // Rounded card corners
        padding: 16, // Inner spacing
        elevation: 2, //Android shadow
        shadowColor: '#000000', // iOS shadow colour
        shadowOffset: { width: 0, height: 1 }, // Shadow direction
        shadowOpacity: 0.08, // Shadow transparency
        shadowRadius: 4, // Shadow blur
    },

    // Top section of the card
    cardHeader: {
        flexDirection: 'row', // Horizontal layout
        justifyContent: 'space-between', // Space between left/right content
        alignItems: 'flex-start', // Align items to top
        marginBottom: 12, // Bottom spacing
    },

    cardHeaderLeft: {
        flex: 1, // Takes remaining width
        marginRight: 12, // Space before status badge
    },

    // User display text
    username: {
        fontSize: 16, // Medium text size
        fontWeight: 'bold', // Bold username
        color: ADMIN.textDark, // Dark text colour
        marginBottom: 2, // Small spacing below
    },

    // E-mail display text
    email: {
        fontSize: 13,
        color: ADMIN.textGrey, // Grey text
    },

    // Status badge container
    statusBadge: {
        borderRadius: 999, // Pill shape
        paddingHorizontal: 10,
        paddingVertical: 4,
    },

    //  Status badge text
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },

    // Box containing approval/rejection reason
    reasonBox: {
        backgroundColor: ADMIN.backgroundSecondary, // Light secondary background
        borderRadius: 8, // Rounded corners
        padding: 12,
        marginBottom: 12,
    },

    // Label above reason text
    reasonLabel: {
        fontSize: 12,
        fontWeight: '600', // Semi-bold
        color: ADMIN.textGrey,
        marginBottom: 4, // Spacing below label
    },

    // Main reason/description text
    reasonText: {
        fontSize: 14,
        color: ADMIN.textDark, // Dark readable text
        lineHeight: 20, // Improves readability
    },

    // Wrapper for confirmation indicators
    confirmationsRow: {
        gap: 6, // Space between confirmation items
        marginBottom: 10,
    },

    // Individual confirmation row
    confirmationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6, // Space between icon and text
    },

    confirmationText: {
        fontSize: 13,
        color: ADMIN.textGrey, // Grey colour
    },

    // Row displaying request date/time
    dateRow: {
        flexDirection: 'row', // Horizontal layout
        alignItems: 'center', // Align icon/text
        gap: 6,
        marginBottom: 14,
    },

    // Date display text
    dateText: {
        fontSize: 13,
        color: ADMIN.textLight, // Light grey text
    },

    // Row containing action buttons
    actionRow: {
        flexDirection: 'row', // Horizontal buttons
        gap: 10,
    },

    // Approve action button
    approveButton: {
        flex: 1, // Equal button width
        flexDirection: 'row', // Horizontal icon/text
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ADMIN.success, // Success green colour
        borderRadius: 8, //Rounded corners
        paddingVertical: 10, // Vertical button padding
        gap: 6,
    },

    approveButtonText: {
        color: '#FFFFFF', // White text
        fontWeight: '600', // Semi-bold
        fontSize: 14,
    },

    rejectButton: {
        flex: 1,
        flexDirection: 'row', // Equal width
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent', // Transparent background
        borderWidth: 1,
        borderColor: ADMIN.error, // Error colour border
        borderRadius: 8,
        paddingVertical: 10,
        gap: 6,
    },

    rejectButtonText: {
        color: ADMIN.error, // Error red text
        fontWeight: '600', // Semi-bold
        fontSize: 14, // Medium text size
    },

    // Empty state wrapper
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        paddingHorizontal: 32,
    },

    // Empty state title text
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: ADMIN.textDark,
        marginTop: 16, // Space above title
        marginBottom: 8, // Space below title
    },

    // Empty state descriptive message
    emptyMessage: {
        fontSize: 14,
        color: ADMIN.textGrey,
        textAlign: 'center', //Center aligned text
        lineHeight: 22, // Improved readability
    },

})