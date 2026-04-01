import React, { useState, useEffect, useCallback } from 'react'
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { COLOURS } from '../../constants/theme'

function getTagColour(tag) {
    if (tag === 'healthy') return COLOURS.tagHealthy
    if (tag === 'broken') return COLOURS.tagBroken
    if (tag === 'diseased') return COLOURS.tagDiseased
    if (tag === 'birds') return COLOURS.tagBirds
    if (tag === 'insects') return COLOURS.tagInsects
    if (tag === 'mammals') return COLOURS.tagMammals

    return {
        background: COLOURS.backgroundSecondary,
        text: COLOURS.textDark,
    }
}

export default function Home() {

    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [currentUserId, setCurrentUserId] = useState(null)
    const [currentUserProfile, setCurrentUserProfile] = useState(null)

    useEffect(() => {
        getUser()
    }, [])

    async function getUser() {
        // get logged in user
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            setCurrentUserId(user.id)

            // get their profile so I know if they are a guardian
            const { data: profile } = await supabase
                .from('profiles')
                .select('guardian_status, username')
                .eq('id', user.id)
                .single()

            if (profile) {
                setCurrentUserProfile(profile)
            }
        }
    }

    const fetchPosts = useCallback(async () => {
        try {
            // get all the posts
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:user_id (
                        username
                    ),
                    trees:tree_id (
                        species,
                        description,
                        street_address,
                        is_adopted,
                        guardian_id,
                        profiles:guardian_id (
                            username
                        )
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) {
                console.log('Post error:', error)
                return
            }

            // check what posts this user has liked
            const { data: userLikes } = await supabase
                .from('likes')
                .select('post_id')
                .eq('user_id', currentUserId)

            const likedIds = userLikes ? userLikes.map(item => item.post_id) : []

            const newPosts = data.map(post => {
                return {
                    ...post,
                    liked: likedIds.includes(post.id),
                }
            })

            // show diseased and broken trees first
            const diseased = newPosts.filter(post => post.tags.includes('diseased'))

            const broken = newPosts.filter(post =>
                post.tags.includes('broken') && !post.tags.includes('diseased')
            )

            const normal = newPosts.filter(post =>
                !post.tags.includes('diseased') && !post.tags.includes('broken')
            )

            setPosts([...diseased, ...broken, ...normal])

        } catch (err) {
            console.log('Something went wrong:', err)
        }

        setLoading(false)
        setRefreshing(false)
    }, [currentUserId])

    useEffect(() => {
        if (currentUserId !== null) {
            fetchPosts()
        }
    }, [currentUserId, fetchPosts])

    function handleRefresh() {
        setRefreshing(true)
        fetchPosts()
    }

    async function handleLike(post) {
        if (!currentUserId) {
            return
        }

        if (post.liked) {
            // unlike post
            await supabase
                .from('likes')
                .delete()
                .eq('post_id', post.id)
                .eq('user_id', currentUserId)

            setPosts(currentPosts => currentPosts.map(item => {
                if (item.id === post.id) {
                    return {
                        ...item,
                        liked: false,
                        likes_count: item.likes_count - 1,
                    }
                }

                return item
            }))
        } else {
            // like post
            await supabase
                .from('likes')
                .insert({
                    post_id: post.id,
                    user_id: currentUserId,
                })

            setPosts(currentPosts => currentPosts.map(item => {
                if (item.id === post.id) {
                    return {
                        ...item,
                        liked: true,
                        likes_count: item.likes_count + 1,
                    }
                }

                return item
            }))
        }
    }

    async function handleAdopt(post) {
        if (!currentUserId) {
            return
        }

        try {
            // update tree as adopted
            await supabase
                .from('trees')
                .update({
                    is_adopted: true,
                    guardian_id: currentUserId,
                    adopted_at: new Date().toISOString(),
                })
                .eq('id', post.tree_id)

            // update it on the screen
            setPosts(currentPosts => currentPosts.map(item => {
                if (item.id === post.id) {
                    return {
                        ...item,
                        trees: {
                            ...item.trees,
                            is_adopted: true,
                            guardian_id: currentUserId,
                            profiles: {
                                username: currentUserProfile?.username || 'You',
                            },
                        },
                    }
                }

                return item
            }))

        } catch (err) {
            console.log('Adopt error:', err)
        }
    }

    function renderPost({ item }) {
        const isGuardian = currentUserProfile?.guardian_status === 'approved'
        const isAdopted = item.trees?.is_adopted
        const guardianUsername = item.trees?.profiles?.username
        const isAdoptedByMe = item.trees?.guardian_id === currentUserId

        return (
            <View style={styles.card}>

                <View style={styles.cardHeader}>
                    <View style={styles.avatarCircle}>
                        <MaterialCommunityIcons
                            name="account"
                            size={20}
                            color={COLOURS.primary}
                        />
                    </View>

                    <Text style={styles.username}>
                        {item.profiles?.username || 'Unknown'}
                    </Text>
                </View>

                <Image
                    source={{ uri: item.image_url }}
                    style={styles.treeImage}
                    resizeMode="cover"
                />

                <View style={styles.speciesRow}>
                    <Text style={styles.speciesName}>
                        {item.trees?.species || 'Unknown species'}
                    </Text>

                    <Text style={styles.speciesDetails}>
                        {item.trees?.description || ''}
                    </Text>
                </View>

                {item.caption ? (
                    <Text style={styles.caption}>{item.caption}</Text>
                ) : null}

                <View style={styles.tagsRow}>
                    {item.tags.map(tag => (
                        <View
                            key={tag}
                            style={[
                                styles.tag,
                                { backgroundColor: getTagColour(tag).background },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tagText,
                                    { color: getTagColour(tag).text },
                                ]}
                            >
                                {tag}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.locationRow}>
                    <MaterialCommunityIcons
                        name="map-marker"
                        size={14}
                        color={COLOURS.textGrey}
                    />

                    <Text style={styles.location}>
                        {item.trees?.street_address || 'Charlton Kings, Cheltenham'}
                    </Text>
                </View>

                <View style={styles.cardFooter}>

                    <TouchableOpacity
                        style={styles.likeButton}
                        onPress={() => handleLike(item)}
                    >
                        <MaterialCommunityIcons
                            name={item.liked ? 'heart' : 'heart-outline'}
                            size={22}
                            color={item.liked ? '#E74C3C' : COLOURS.textGrey}
                        />

                        <Text
                            style={[
                                styles.likeCount,
                                item.liked
                                    ? { color: '#E74C3C' }
                                    : { color: COLOURS.textGrey },
                            ]}
                        >
                            {item.likes_count}
                        </Text>
                    </TouchableOpacity>

                    {isAdopted ? (
                        <View style={styles.adoptedBadge}>
                            <MaterialCommunityIcons
                                name="shield-account"
                                size={14}
                                color={COLOURS.primary}
                            />

                            <Text style={styles.adoptedText}>
                                {isAdoptedByMe ? 'You' : guardianUsername || 'Guardian'}
                            </Text>
                        </View>
                    ) : isGuardian ? (
                        <TouchableOpacity
                            style={styles.adoptButton}
                            onPress={() => handleAdopt(item)}
                        >
                            <Text style={styles.adoptButtonText}>Adopt Tree</Text>
                        </TouchableOpacity>
                    ) : null}

                </View>

            </View>
        )
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header} />

                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLOURS.primary} />
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea}>

            <View style={styles.header} />

            <FlatList
                data={posts}
                keyExtractor={item => item.id}
                renderItem={renderPost}
                contentContainerStyle={styles.feedContent}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={COLOURS.primary}
                    />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons
                            name="tree"
                            size={64}
                            color={COLOURS.textLight}
                        />

                        <Text style={styles.emptyTitle}>No posts yet</Text>

                        <Text style={styles.emptyMessage}>
                            Be the first to post a tree in Charlton Kings!
                        </Text>
                    </View>
                )}
            />

        </SafeAreaView>
    )
}