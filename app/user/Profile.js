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

