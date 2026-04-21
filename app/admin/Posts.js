import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { ADMIN_COLOURS as ADMIN } from '../../constants/theme'



function getTagStyle(tag) {
    if (tag === 'healthy')  return { background: '#D4EDDA', text: '#155724' }
    if (tag === 'broken')   return { background: '#FFF3CD', text: '#856404' }
    if (tag === 'diseased') return { background: '#F8D7DA', text: '#721C24' }
    if (tag === 'birds')    return { background: '#CCE5FF', text: '#004085' }
    if (tag === 'insects')  return { background: '#E2D9F3', text: '#432874' }
    if (tag === 'mammals')  return { background: '#D1ECF1', text: '#0C5460' }
    return { background: ADMIN.backgroundSecondary, text: ADMIN.textGrey }
}

export default function Posts() {

    const [activeTab, setActiveTab] = useState('posts')
    const [posts, setPosts] = useState([])
    const [updates, setUpdates] = useState([])
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
 
            const { data: postsData, error: postsError } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:user_id (username),
                    trees:tree_id (species, is_adopted, street_address)
                `)
                .order('created_at', { ascending: false })

            if (postsError) {
                console.log('Posts fetch error:', postsError)
            }

     
            const { data: updatesData, error: updatesError } = await supabase
                .from('guardian_updates')
                .select(`
                    *,
                    profiles:guardian_id (username),
                    trees:tree_id (species)
                `)
                .order('created_at', { ascending: false })

            if (updatesError) {
                console.log('Updates fetch error:', updatesError)
            }

            if (postsData) setPosts(postsData)
            if (updatesData) setUpdates(updatesData)

        } catch (err) {
            console.log('Error fetching posts:', err)
        } finally {
            setLoading(false)
        }
    }


    async function handleDeletePost(post) {
        try {
            const treeId = post.tree_id
            const isAdopted = post.trees?.is_adopted

            await supabase.from('posts').delete().eq('id', post.id)

            setPosts(current => current.filter(p => p.id !== post.id))

            if (!isAdopted) {
                const { data: remainingPosts } = await supabase
                    .from('posts')
                    .select('id')
                    .eq('tree_id', treeId)

                if (!remainingPosts || remainingPosts.length === 0) {
                    await supabase.from('trees').delete().eq('id', treeId)
                }
            }

        } catch (err) {
            console.log('Error deleting post:', err)
        }
    }

    async function handleDeleteUpdate(updateId) {
        try {
            await supabase.from('guardian_updates').delete().eq('id', updateId)
            setUpdates(current => current.filter(u => u.id !== updateId))
        } catch (err) {
            console.log('Error deleting update:', err)
        }
    }

    function renderPost({ item }) {
        return (
            <View style={styles.card}>

                <Image
                    source={{ uri: item.image_url }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePost(item)}
                >
                    <MaterialCommunityIcons name="trash-can" size={18} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.cardContent}>

                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="account" size={15} color={ADMIN.textLight} />
                        <Text style={styles.infoText}>
                            {item.profiles?.username || 'Unknown'}
                        </Text>
                        <MaterialCommunityIcons name="tree" size={15} color={ADMIN.textLight} />
                        <Text style={styles.infoText}>
                            {item.trees?.species || 'Unknown tree'}
                        </Text>
                    </View>

                    {item.caption ? (
                        <Text style={styles.caption} numberOfLines={2}>
                            {item.caption}
                        </Text>
                    ) : null}

                    <View style={styles.tagsRow}>
                        {item.tags.map(tag => {
                            const tagStyle = getTagStyle(tag)
                            return (
                                <View
                                    key={tag}
                                    style={[styles.tag, { backgroundColor: tagStyle.background }]}
                                >
                                    <Text style={[styles.tagText, { color: tagStyle.text }]}>
                                        {tag}
                                    </Text>
                                </View>
                            )
                        })}
                    </View>

                    <View style={styles.footerRow}>
                        <View style={styles.footerItem}>
                            <MaterialCommunityIcons name="map-marker" size={13} color={ADMIN.textLight} />
                            <Text style={styles.footerText}>
                                {item.trees?.street_address || 'Charlton Kings'}
                            </Text>
                        </View>
                        <View style={styles.footerItem}>
                            <MaterialCommunityIcons name="calendar" size={13} color={ADMIN.textLight} />
                            <Text style={styles.footerText}>
                                {new Date(item.created_at).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </Text>
                        </View>
                    </View>

                </View>

            </View>
        )
    }

    function renderUpdate({ item }) {
        return (
            <View style={styles.card}>

                <Image
                    source={{ uri: item.image_url }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteUpdate(item.id)}
                >
                    <MaterialCommunityIcons name="trash-can" size={18} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.cardContent}>

                    <View style={styles.guardianBadge}>
                        <MaterialCommunityIcons name="shield-account" size={14} color={ADMIN.primary} />
                        <Text style={styles.guardianBadgeText}>Guardian Update</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="account" size={15} color={ADMIN.textLight} />
                        <Text style={styles.infoText}>
                            {item.profiles?.username || 'Unknown'}
                        </Text>
                        <MaterialCommunityIcons name="tree" size={15} color={ADMIN.textLight} />
                        <Text style={styles.infoText}>
                            {item.trees?.species || 'Unknown tree'}
                        </Text>
                    </View>

                    {item.caption ? (
                        <Text style={styles.caption} numberOfLines={2}>
                            {item.caption}
                        </Text>
                    ) : null}

                    <View style={styles.tagsRow}>
                        {item.tags.map(tag => {
                            const tagStyle = getTagStyle(tag)
                            return (
                                <View
                                    key={tag}
                                    style={[styles.tag, { backgroundColor: tagStyle.background }]}
                                >
                                    <Text style={[styles.tagText, { color: tagStyle.text }]}>
                                        {tag}
                                    </Text>
                                </View>
                            )
                        })}
                    </View>

                    <View style={styles.footerRow}>
                        {item.street_address ? (
                            <View style={styles.footerItem}>
                                <MaterialCommunityIcons name="map-marker" size={13} color={ADMIN.textLight} />
                                <Text style={styles.footerText}>{item.street_address}</Text>
                            </View>
                        ) : null}
                        <View style={styles.footerItem}>
                            <MaterialCommunityIcons name="calendar" size={13} color={ADMIN.textLight} />
                            <Text style={styles.footerText}>
                                {new Date(item.created_at).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </Text>
                        </View>
                    </View>

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

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Posts & Updates</Text>
                <Text style={styles.headerSubtitle}>
                    {posts.length} posts · {updates.length} guardian updates
                </Text>
            </View>

            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        activeTab === 'posts' ? styles.toggleButtonActive : styles.toggleButtonInactive
                    ]}
                    onPress={() => setActiveTab('posts')}
                >
                    <MaterialCommunityIcons
                        name="image-multiple"
                        size={16}
                        color={activeTab === 'posts' ? '#FFFFFF' : ADMIN.primary}
                    />
                    <Text style={[
                        styles.toggleButtonText,
                        activeTab === 'posts' ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive
                    ]}>
                        Posts ({posts.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        activeTab === 'updates' ? styles.toggleButtonActive : styles.toggleButtonInactive
                    ]}
                    onPress={() => setActiveTab('updates')}
                >
                    <MaterialCommunityIcons
                        name="shield-account"
                        size={16}
                        color={activeTab === 'updates' ? '#FFFFFF' : ADMIN.primary}
                    />
                    <Text style={[
                        styles.toggleButtonText,
                        activeTab === 'updates' ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive
                    ]}>
                        Updates ({updates.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'posts' ? (
                <FlatList
                    data={posts}
                    keyExtractor={item => item.id}
                    renderItem={renderPost}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="image-off" size={64} color={ADMIN.textLight} />
                            <Text style={styles.emptyTitle}>No posts yet</Text>
                        </View>
                    )}
                />
            ) : (
                <FlatList
                    data={updates}
                    keyExtractor={item => item.id}
                    renderItem={renderUpdate}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="shield-off" size={64} color={ADMIN.textLight} />
                            <Text style={styles.emptyTitle}>No guardian updates yet</Text>
                        </View>
                    )}
                />
            )}

        </View>
    )
}