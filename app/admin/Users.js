import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { ADMIN_COLOURS as ADMIN } from '../../constants/theme'


function getGuardianStatusStyle(status) {
    if (status === 'approved') {
        return { label: 'Guardian', background: '#D4EDDA', text: '#155724' }
    } else if (status === 'pending') {
        return { label: 'Pending', background: '#FFF3CD', text: '#856404' }
    } else if (status === 'rejected') {
        return { label: 'Rejected', background: '#F8D7DA', text: '#721C24' }
    } else {
        return { label: 'User', background: ADMIN.backgroundSecondary, text: ADMIN.textGrey }
    }
}

export default function Users() {

  

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

  

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        try {
      
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('is_admin', false)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching users:', error)
                return
            }

            // For each profile fetch their post count and adopted tree count
            const usersWithCounts = await Promise.all(
                profiles.map(async (profile) => {

                    // Count their posts
                    const { count: postCount } = await supabase
                        .from('posts')
                        .select('id', { count: 'exact', head: true })
                        .eq('user_id', profile.id)

                    // Count their adopted trees
                    const { count: treeCount } = await supabase
                        .from('trees')
                        .select('id', { count: 'exact', head: true })
                        .eq('guardian_id', profile.id)
                        .eq('is_adopted', true)

                    return {
                        ...profile,
                        postCount: postCount || 0,
                        adoptedTreeCount: treeCount || 0,
                    }
                })
            )

            setUsers(usersWithCounts)

        } catch (err) {
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }

    

    async function handleDeleteUser(user) {
        // Show confirmation before deleting
        Alert.alert(
            'Delete User',
            `Are you sure you want to delete ${user.username}? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase.rpc('delete_user_by_admin', {target_user_id: user.id,})
                            if (error) {
                                console.error('Error deleting user:', error)
                                return
                            }

                            // Remove from local state immediately
                            setUsers(current => current.filter(u => u.id !== user.id))

                        } catch (err) {
                            console.error('Error:', err)
                        }
                    }
                }
            ]
        )
    }

    const filteredUsers = users.filter(user => {
        if (!search) return true
        const query = search.toLowerCase()
        return (
            user.username?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query)
        )
    })


    function renderUser({ item }) {
        const guardianStyle = getGuardianStatusStyle(item.guardian_status)

        return (
            <View style={styles.card}>

               
                <View style={styles.cardHeader}>

                    <View style={styles.cardHeaderLeft}>
                        <View style={styles.avatarCircle}>
                            <MaterialCommunityIcons
                                name="account"
                                size={22}
                                color={ADMIN.primary}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.username} numberOfLines={1}>
                                {item.username}
                            </Text>
                            <Text style={styles.email} numberOfLines={1}>
                                {item.email || 'No email'}
                            </Text>
                        </View>
                    </View>

                  
                    <View style={styles.cardHeaderRight}>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: guardianStyle.background }
                        ]}>
                            <Text style={[styles.statusText, { color: guardianStyle.text }]}>
                                {guardianStyle.label}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteUser(item)}
                        >
                            <MaterialCommunityIcons
                                name="trash-can-outline"
                                size={18}
                                color={ADMIN.error}
                            />
                        </TouchableOpacity>
                    </View>

                </View>

            
                <View style={styles.infoGrid}>

       
                    <View style={styles.infoItem}>
                        <MaterialCommunityIcons
                            name="image-multiple"
                            size={16}
                            color={ADMIN.textGrey}
                        />
                        <Text style={styles.infoText}>{item.postCount} posts</Text>
                    </View>

                  
                    <View style={styles.infoItem}>
                        <MaterialCommunityIcons
                            name="tree"
                            size={16}
                            color={ADMIN.textGrey}
                        />
                        <Text style={styles.infoText}>{item.adoptedTreeCount} trees</Text>
                    </View>

                    {/* Admin badge — only show if is_admin is true */}
                    {item.is_admin ? (
                        <View style={[styles.infoItem, { backgroundColor: ADMIN.primaryLight }]}>
                            <MaterialCommunityIcons
                                name="shield-crown"
                                size={16}
                                color={ADMIN.primary}
                            />
                            <Text style={[styles.infoText, { color: ADMIN.primary }]}>Admin</Text>
                        </View>
                    ) : null}

                </View>

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


    return (
        <View style={styles.container}>

            {/* ── Navy header ── */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Users</Text>
                <Text style={styles.headerSubtitle}>
                    {users.length} registered users
                </Text>
            </View>

            {/* ── Search bar ── */}
            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={20} color={ADMIN.textLight} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by username or email..."
                    placeholderTextColor={ADMIN.textLight}
                    value={search}
                    onChangeText={setSearch}
                    autoCapitalize="none"
                />
                {search ? (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <MaterialCommunityIcons
                            name="close-circle"
                            size={18}
                            color={ADMIN.textLight}
                        />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* ── Users list ── */}
            <FlatList
                data={filteredUsers}
                keyExtractor={item => item.id}
                renderItem={renderUser}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons
                            name="account-search"
                            size={64}
                            color={ADMIN.textLight}
                        />
                        <Text style={styles.emptyTitle}>No users found</Text>
                        <Text style={styles.emptyMessage}>
                            Try a different search term.
                        </Text>
                    </View>
                )}
            />

        </View>
    )
}