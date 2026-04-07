import React, { useState, useEffect, useCallback } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    FlatList,
    Image,
    ActivityIndicator,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { COLOURS } from '../../constants/theme'


export default function Profile({ navigation }) {

    const [profile, setProfile] = useState(null)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentUserId, setCurrentUserId] = useState(null)

    const [editingUsername, setEditingUsername] = useState(false)
    const [newUsername, setNewUsername] = useState('')
    const [usernameLoading, setUsernameLoading] = useState(false)
    const [usernameError, setUsernameError] = useState('')
    const [usernameSuccess, setUsernameSuccess] = useState(false)

    const fetchProfileData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setCurrentUserId(user.id)

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileData) {
                setProfile(profileData)
                setNewUsername(profileData.username || '')
            }

            const { data: postsData } = await supabase
                .from('posts')
                .select(`*, trees:tree_id (species)`)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (postsData) {
                setPosts(postsData)
            }

        } catch (err) {
            console.log('Error fetching profile:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProfileData()
    }, [fetchProfileData])

    async function handleSaveUsername() {
        setUsernameError('')

        if (!newUsername) {
            setUsernameError('Please enter a username.')
            return
        }

        if (newUsername.length > 20) {
            setUsernameError('Username must be 20 characters or less.')
            return
        }

        if (!/^[a-zA-Z0-9]+$/.test(newUsername)) {
            setUsernameError('Username can only contain letters and numbers.')
            return
        }

        setUsernameLoading(true)

        try {
            const { data: existing } = await supabase
                .from('profiles')
                .select('username')
                .ilike('username', newUsername)
                .neq('id', currentUserId)
                .single()

            if (existing) {
                setUsernameError('This username is already taken.')
                setUsernameLoading(false)
                return
            }

            const { error } = await supabase
                .from('profiles')
                .update({ username: newUsername })
                .eq('id', currentUserId)

            if (error) {
                setUsernameError('Failed to update username.')
                return
            }

            setProfile(prev => ({ ...prev, username: newUsername }))
            setUsernameSuccess(true)
            setEditingUsername(false)

            setTimeout(() => {
                setUsernameSuccess(false)
            }, 3000)

        } catch (err) {
            setUsernameError('Something went wrong.')
        }

        setUsernameLoading(false)
    }

    async function handleDeletePost(postId) {
        await supabase.from('posts').delete().eq('id', postId)
        setPosts(current => current.filter(post => post.id !== postId))
    }

    async function handleLogout() {
        await supabase.auth.signOut()

        navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
        })
    }

    function renderPostCard({ item }) {
        return (
            <View style={styles.postCard}>
                <Image
                    source={{ uri: item.image_url }}
                    style={styles.postImage}
                    resizeMode="cover"
                />

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePost(item.id)}
                >
                    <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={16}
                        color={COLOURS.error}
                    />
                </TouchableOpacity>

                <View style={styles.postInfo}>
                    <Text style={styles.postSpecies} numberOfLines={1}>
                        {item.trees?.species || 'Unknown'}
                    </Text>

                    {item.caption ? (
                        <Text style={styles.postCaption} numberOfLines={2}>
                            {item.caption}
                        </Text>
                    ) : (
                        <Text style={styles.postNoCaption}>No caption</Text>
                    )}
                </View>
            </View>
        )
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLOURS.primary} />
            </View>
        )
    }

    return (
        <View style={styles.container}>

            <View style={styles.header} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >

                <View style={styles.profileRow}>

                    <View style={styles.avatarContainer}>
                        <MaterialCommunityIcons
                            name="account"
                            size={44}
                            color={COLOURS.primary}
                        />
                    </View>

                    <View style={styles.profileMiddle}>
                        <Text style={styles.username}>
                            {profile?.username || 'User'}
                        </Text>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{posts.length}</Text>
                                <Text style={styles.statLabel}>Posts</Text>
                            </View>

                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>
                                    {profile?.likes_received || 0}
                                </Text>
                                <Text style={styles.statLabel}>Likes</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <MaterialCommunityIcons
                            name="logout"
                            size={22}
                            color={COLOURS.error}
                        />
                    </TouchableOpacity>

                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Account Settings</Text>

                <View style={styles.settingCard}>
                    <View style={styles.settingHeader}>
                        <Text style={styles.settingLabel}>Username</Text>

                        <TouchableOpacity
                            onPress={() => {
                                setEditingUsername(!editingUsername)
                                setUsernameError('')
                            }}
                        >
                            <Text style={styles.editLink}>
                                {editingUsername ? 'Cancel' : 'Edit'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {usernameSuccess ? (
                        <View style={styles.successBox}>
                            <MaterialCommunityIcons
                                name="check-circle"
                                size={16}
                                color={COLOURS.primary}
                            />
                            <Text style={styles.successText}>
                                Username updated successfully
                            </Text>
                        </View>
                    ) : null}

                    {usernameError ? (
                        <Text style={styles.fieldError}>{usernameError}</Text>
                    ) : null}

                    {editingUsername ? (
                        <View style={styles.editBlock}>
                            <TextInput
                                style={styles.input}
                                value={newUsername}
                                onChangeText={setNewUsername}
                                autoCapitalize="none"
                                placeholder="Enter new username"
                                placeholderTextColor={COLOURS.textLight}
                                maxLength={20}
                            />

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSaveUsername}
                                disabled={usernameLoading}
                            >
                                {usernameLoading ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.saveButtonText}>
                                        Save Username
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Text style={styles.settingValue}>
                            {profile?.username}
                        </Text>
                    )}
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>My Posts</Text>

                {posts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons
                            name="tree"
                            size={48}
                            color={COLOURS.textLight}
                        />
                        <Text style={styles.emptyText}>No posts yet</Text>
                    </View>
                ) : (
                    <FlatList
                        data={posts}
                        keyExtractor={item => item.id}
                        renderItem={renderPostCard}
                        numColumns={2}
                        columnWrapperStyle={styles.gridRow}
                        contentContainerStyle={styles.grid}
                        scrollEnabled={false}
                    />
                )}

            </ScrollView>

        </View>
    )
}

const styles = StyleSheet.create({

    // Loading container
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLOURS.background,
    },

    // Main container
    container: {
        flex: 1,
        backgroundColor: COLOURS.background,
    },

    // The thin green strip at the top
    header: {
        backgroundColor: COLOURS.primary,
        paddingTop: 50,
        paddingBottom: 6,
    },

    // Scroll view padding
    scrollContent: {
        paddingBottom: 40,
    },


    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 14,
    },

    // The circular avatar
    // backgroundColor gives it a light green background
    // width and height set the size
    // borderRadius makes it perfectly round
    avatarContainer: {
        backgroundColor: COLOURS.primaryLight,
        width: 74,
        height: 74,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },



    // The middle section with username and stats
    // flex 1 takes all remaining space
    profileMiddle: {
        flex: 1,
    },

    // The username text
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLOURS.textDark,
        marginBottom: 8,
    },

    // The stats row
    statsRow: {
        flexDirection: 'row',
        gap: 20,
    },

    // Each stat item
    statItem: {
        alignItems: 'flex-start',
    },

    // The stat number
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLOURS.primary,
    },

    // The stat label
    statLabel: {
        fontSize: 12,
        color: COLOURS.textGrey,
    },


    logoutButton: {
        padding: 4,
    },


    divider: {
        height: 1,
        backgroundColor: COLOURS.border,
        marginTop: 4,
    },


    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLOURS.textDark,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },

    // Each settings card
    // backgroundColor gives it a white background
    // borderRadius rounds the corners
    // padding adds space inside
    // marginHorizontal keeps it aligned
    // marginBottom adds space between cards
    settingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLOURS.border,
    },

    // The header row inside each setting card
    // flexDirection row puts label and edit link side by side
    // justifyContent space-between pushes them apart
    // marginBottom adds space below
    settingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },

    // The setting label e.g. Username, Email, Password
    settingLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLOURS.textGrey,
    },

    // The Edit / Cancel / Change link
    editLink: {
        fontSize: 14,
        color: COLOURS.primary,
        fontWeight: '600',
    },

    // The current value text
    settingValue: {
        fontSize: 15,
        color: COLOURS.textDark,
    },

    // The success box shown after a successful save
    successBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLOURS.primaryLight,
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
        gap: 6,
    },

    // The success text
    successText: {
        fontSize: 13,
        color: COLOURS.primary,
        fontWeight: '600',
    },

    // The field error text
    fieldError: {
        fontSize: 12,
        color: COLOURS.error,
        marginBottom: 6,
    },

    // The edit block containing input and save button
    editBlock: {
        gap: 8,
        marginTop: 4,
    },

    // The text input
    input: {
        backgroundColor: COLOURS.backgroundSecondary,
        borderWidth: 1,
        borderColor: COLOURS.textLight,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: COLOURS.textDark,
    },



    // The save button
    // backgroundColor uses the primary green
    saveButton: {
        backgroundColor: COLOURS.primary,
        borderRadius: 8,
        paddingVertical: 11,
        alignItems: 'center',
    },

    // The save button text
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },

    // The posts grid padding
    grid: {
        paddingHorizontal: 12,
        paddingBottom: 16,
    },

    // Each row in the two column grid
    gridRow: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    // Each post card
    postCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLOURS.border,
    },

    // The post image
    postImage: {
        width: '100%',
        height: 130,
    },

    // The delete button on top of the image
    deleteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 999,
        padding: 6,
    },

    // The info section below the image
    postInfo: {
        padding: 8,
    },

    // The species name
    postSpecies: {
        fontSize: 13,
        fontWeight: '600',
        color: COLOURS.textDark,
        marginBottom: 3,
    },

    // The caption text
    postCaption: {
        fontSize: 12,
        color: COLOURS.textGrey,
        lineHeight: 17,
    },

    // The No caption placeholder
    postNoCaption: {
        fontSize: 12,
        color: COLOURS.textLight,
        fontStyle: 'italic',
    },

    // The empty state
    emptyState: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 40,
    },

    // The No posts yet text
    emptyText: {
        fontSize: 15,
        color: COLOURS.textLight,
        marginTop: 12,
    },


})