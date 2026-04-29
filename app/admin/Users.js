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

const styles = StyleSheet.create({

    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ADMIN.backgroundSecondary,
    },

    // Main container
    container: {
        flex: 1,
        backgroundColor: ADMIN.backgroundSecondary,
    },

    // Navy header
    // paddingTop clears the phone notch
    // paddingBottom controls the header height
    // paddingHorizontal adds space on the sides
    header: {
        backgroundColor: ADMIN.primary,
        paddingTop: 56,
        paddingBottom: 20,
        paddingHorizontal: 16,
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },

    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
    },

    // Search bar container
    // flexDirection row puts icon, input, and clear button side by side
    // alignItems center vertically centres them
    // backgroundColor gives it a white background
    // borderRadius rounds the corners
    // paddingHorizontal adds space inside on the sides
    // paddingVertical controls the height
    // gap adds space between items
    // elevation and shadow add a subtle drop shadow
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 8,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },

    // The search input
    // flex 1 makes it take all remaining space
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: ADMIN.textDark,
    },

    listContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 24,
    },

    separator: {
        height: 10,
    },

    // Each user card
    // backgroundColor gives it a white background
    // borderRadius rounds the corners
    // padding adds space inside
    // elevation and shadow add a subtle drop shadow
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },

    // Card header row
    // flexDirection row puts left and right side by side
    // justifyContent space-between pushes them apart
    // alignItems center vertically centres them
    // marginBottom adds space below before the info grid
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },

    // Left side — avatar and username/email
    // flexDirection row puts them side by side
    // alignItems center vertically centres them
    // flex 1 takes all remaining space
    // gap adds space between avatar and text
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        marginRight: 12,
    },

    // Right side — status badge and delete button
    // flexDirection row puts them side by side
    // alignItems center vertically centres them
    // gap adds space between them
    cardHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    // The circular avatar
    // backgroundColor uses the light blue tint
    // width and height set the size
    // borderRadius makes it perfectly round
    avatarCircle: {
        backgroundColor: ADMIN.primaryLight,
        width: 40,
        height: 40,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },

    username: {
        fontSize: 15,
        fontWeight: '600',
        color: ADMIN.textDark,
        marginBottom: 2,
    },

    email: {
        fontSize: 12,
        color: ADMIN.textGrey,
    },

    // Status badge
    // borderRadius makes it pill shaped
    statusBadge: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },

    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },

    // Delete button
    // padding makes it easy to tap
    deleteButton: {
        padding: 4,
    },

    // Info grid
    // flexDirection row puts items side by side
    // flexWrap wrap allows them to wrap to new lines
    // gap adds space between items
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    // Each info item
    // flexDirection row puts icon and text side by side
    // alignItems center vertically centres them
    // backgroundColor gives it a light background
    // borderRadius makes it pill shaped
    // paddingHorizontal and paddingVertical add space inside
    // gap adds space between icon and text
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ADMIN.backgroundSecondary,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 5,
    },

    infoText: {
        fontSize: 12,
        color: ADMIN.textGrey,
    },

    emptyState: {
        alignItems: 'center',
        paddingTop: 80,
        paddingHorizontal: 32,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: ADMIN.textDark,
        marginTop: 16,
        marginBottom: 8,
    },

    emptyMessage: {
        fontSize: 14,
        color: ADMIN.textGrey,
        textAlign: 'center',
        lineHeight: 22,
    },

})