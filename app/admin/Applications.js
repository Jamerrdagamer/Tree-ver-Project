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