import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    FlatList,
    ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { COLOURS } from '../../constants/theme'

export default function Guardian({ navigation }) {

    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)
    const [status, setStatus] = useState(null)

    const [reason, setReason] = useState('')
    const [responsibilityTicked, setResponsibilityTicked] = useState(false)
    const [over16Ticked, setOver16Ticked] = useState(false)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [trees, setTrees] = useState([])
    const [myUpdates, setMyUpdates] = useState([])

    useEffect(() => {
        getGuardianInfo()
    }, [])

    async function getGuardianInfo() {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('username, guardian_status, guardian_retry_date')
                .eq('id', authUser.id)
                .single()

            if (profile) {
                const newUser = {
                    id: authUser.id,
                    email: authUser.email,
                    username: profile.username,
                    retryDate: profile.guardian_retry_date,
                }

                setUser(newUser)
                setStatus(profile.guardian_status)

                if (profile.guardian_status === 'approved') {
                    getAdoptedTrees(authUser.id)
                    getMyUpdates(authUser.id)
                }
            }

        } catch (err) {
            console.log('Guardian error:', err)
        }

        setLoading(false)
    }

    async function getAdoptedTrees(userId) {
        const { data, error } = await supabase
            .from('trees')
            .select('*')
            .eq('guardian_id', userId)
            .eq('is_adopted', true)

        if (error) {
            console.log('Adopted trees error:', error)
            return
        }

        setTrees(data || [])
    }


    async function getMyUpdates(userId) {
        const { data, error } = await supabase
            .from('guardian_updates')
            .select(`
                *,
                trees:tree_id (species, street_address)
            `)
            .eq('guardian_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.log('My updates error:', error)
            return
        }

        setMyUpdates(data || [])
    }

    function validateApplication() {
        if (reason === '') {
            setError('Please say why you want to be a guardian.')
            return false
        }

        if (reason.length > 150) {
            setError('Reason must be 150 characters or less.')
            return false
        }

        if (!responsibilityTicked) {
            setError('Please confirm you will look after the tree.')
            return false
        }

        if (!over16Ticked) {
            setError('Please confirm you are over 16.')
            return false
        }

        return true
    }

    async function handleApply() {
        setError('')

        if (!validateApplication()) {
            return
        }

        setSubmitting(true)

        try {
            const { error: applicationError } = await supabase
                .from('guardian_applications')
                .upsert({
                    user_id: user.id,
                    reason: reason,
                    responsibility_confirmed: responsibilityTicked,
                    over_16_confirmed: over16Ticked,
                    status: 'pending',
                    applied_at: new Date().toISOString(),
                }, {
                    onConflict: 'user_id',
                })

            if (applicationError) {
                console.log('Application error:', applicationError)
                setError('Application could not be sent.')
                setSubmitting(false)
                return
            }

            await supabase
                .from('profiles')
                .update({ guardian_status: 'pending' })
                .eq('id', user.id)

            setStatus('pending')

        } catch (err) {
            console.log('Apply catch error:', err)
            setError('Something went wrong.')
        }

        setSubmitting(false)
    }

    async function handleUnadopt(treeId) {
        await supabase
            .from('trees')
            .update({
                is_adopted: false,
                guardian_id: null,
                adopted_at: null,
            })
            .eq('id', treeId)

        setTrees(current => current.filter(tree => tree.id !== treeId))
    }

    function renderTree({ item }) {
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons
                        name="tree"
                        size={28}
                        color={COLOURS.primary}
                    />

                    <View style={styles.cardHeaderText}>
                        <Text style={styles.speciesName}>
                            {item.species || 'Unknown tree'}
                        </Text>

                        <Text style={styles.speciesDetails} numberOfLines={2}>
                            {item.description || 'No description available.'}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                        name="map-marker"
                        size={16}
                        color={COLOURS.textGrey}
                    />
                    <Text style={styles.infoText}>
                        {item.street_address || 'No address saved'}
                    </Text>
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={styles.updateButton}
                        onPress={() => navigation.navigate('GuardianUpdate', { tree: item })}
                    >
                        <Text style={styles.updateButtonText}>Post Update</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.unadoptButton}
                        onPress={() => handleUnadopt(item.id)}
                    >
                        <Text style={styles.unadoptButtonText}>Unadopt</Text>
                    </TouchableOpacity>
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

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Could not load user.</Text>
            </View>
        )
    }

    if (status === 'pending') {
        return (
            <View style={styles.container}>
                <View style={styles.header} />

                <View style={styles.centerContent}>
                    <MaterialCommunityIcons
                        name="clock-outline"
                        size={80}
                        color={COLOURS.primary}
                    />

                    <Text style={styles.heading}>Application Pending</Text>

                    <Text style={styles.message}>
                        Your guardian application is waiting to be reviewed.
                    </Text>
                </View>
            </View>
        )
    }

    if (status === 'rejected') {
        return (
            <View style={styles.container}>
                <View style={styles.header} />

                <View style={styles.centerContent}>
                    <MaterialCommunityIcons
                        name="lock-outline"
                        size={80}
                        color={COLOURS.error}
                    />

                    <Text style={styles.heading}>Application Rejected</Text>

                    <Text style={styles.message}>
                        Your application was not accepted this time.
                    </Text>
                </View>
            </View>
        )
    }

    if (status === 'approved') {
        return (
            <View style={styles.container}>
                <View style={styles.header} />

                <FlatList
                    data={trees}
                    keyExtractor={item => item.id}
                    renderItem={renderTree}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={() => (
                        <>
                            <Text style={styles.screenTitle}>My Adopted Trees</Text>
                            <Text style={styles.description}>
                                These are the trees you are currently looking after.
                            </Text>
                        </>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyBox}>
                            <MaterialCommunityIcons
                                name="tree-outline"
                                size={60}
                                color={COLOURS.textLight}
                            />
                            <Text style={styles.emptyText}>No adopted trees yet</Text>
                        </View>
                    )}
                    ListFooterComponent={() => (
                        <View style={{ marginTop: 24 }}>
                            <Text style={styles.screenTitle}>My Updates</Text>
                            <Text style={styles.description}>
                                All the updates you have posted about your trees.
                            </Text>

                            {myUpdates.length === 0 ? (
                                <View style={styles.emptyBox}>
                                    <MaterialCommunityIcons
                                        name="image-off-outline"
                                        size={60}
                                        color={COLOURS.textLight}
                                    />
                                    <Text style={styles.emptyText}>No updates posted yet</Text>
                                </View>
                            ) : (
                                myUpdates.map(update => (
                                    <View key={update.id} style={styles.updateCard}>
                                        <Image
                                            source={{ uri: update.image_url }}
                                            style={styles.updateImage}
                                            contentFit="cover"
                                        />
                                        <View style={styles.updateBody}>
                                            <Text style={styles.updateTreeName}>
                                                {update.trees?.species || 'Unknown tree'}
                                            </Text>
                                            {update.caption ? (
                                                <Text style={styles.updateCaption} numberOfLines={2}>
                                                    {update.caption}
                                                </Text>
                                            ) : null}
                                            <Text style={styles.updateDate}>
                                                {new Date(update.created_at).toLocaleDateString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    )}
                />
            </View>
        )
    }

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.header} />

            <Text style={styles.screenTitle}>Become a Guardian</Text>

            <Text style={styles.description}>
                Guardians adopt trees and give updates about their condition.
            </Text>

            {error ? (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <Text style={styles.label}>Username</Text>
            <View style={styles.autoFilledInput}>
                <Text style={styles.autoFilledText}>{user.username}</Text>
            </View>

            <Text style={styles.label}>Why do you want to be a guardian?</Text>
            <TextInput
                style={styles.textArea}
                value={reason}
                onChangeText={setReason}
                placeholder="Write your reason..."
                placeholderTextColor={COLOURS.textLight}
                multiline={true}
                maxLength={150}
            />

            <Text style={styles.charCount}>{reason.length}/150</Text>

            <TouchableOpacity
                style={styles.tickRow}
                onPress={() => setResponsibilityTicked(!responsibilityTicked)}
            >
                <MaterialCommunityIcons
                    name={responsibilityTicked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={22}
                    color={COLOURS.primary}
                />
                <Text style={styles.tickText}>
                    I will take responsibility for my adopted trees.
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.tickRow}
                onPress={() => setOver16Ticked(!over16Ticked)}
            >
                <MaterialCommunityIcons
                    name={over16Ticked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={22}
                    color={COLOURS.primary}
                />
                <Text style={styles.tickText}>
                    I confirm I am over 16.
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={handleApply}
                disabled={submitting}
            >
                {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.buttonText}>Submit Application</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    )
}


// Creates a stylesheet for the adoption and updates screens
const styles = StyleSheet.create({

    // Main screen container
    container: {
        flex: 1,
        backgroundColor: COLOURS.background,
    },

    // Scrollable screen background
    scrollView: {
        backgroundColor: COLOURS.background,
    },

    // Padding for scrollable content
    scrollContent: {
        paddingBottom: 40,
    },

    // Header section at the top of the screen
    header: {
        backgroundColor: COLOURS.primary,
        paddingTop: 50,
        paddingBottom: 6,
        marginBottom: 20,
    },

    // Full-screen loading state container
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLOURS.background,
    },

    // Main screen title styling
    screenTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLOURS.textDark,
        paddingHorizontal: 16,
        marginBottom: 10,
    },

    // Description text below the title
    description: {
        fontSize: 14,
        color: COLOURS.textGrey,
        paddingHorizontal: 16,
        lineHeight: 22,
        marginBottom: 20,
    },

    // Labels displayed above form fields
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLOURS.textDark,
        paddingHorizontal: 16,
        marginTop: 14,
        marginBottom: 6,
    },

    // Read-only input container styling
    autoFilledInput: {
        backgroundColor: COLOURS.backgroundSecondary,
        borderRadius: 10,
        padding: 12,
        marginHorizontal: 16,
    },

    // Text inside auto-filled input fields
    autoFilledText: {
        color: COLOURS.textGrey,
        fontSize: 15,
    },

    // Multi-line text input styling
    textArea: {
        backgroundColor: COLOURS.backgroundSecondary,
        borderWidth: 1,
        borderColor: COLOURS.textLight,
        borderRadius: 10,
        padding: 12,
        marginHorizontal: 16,
        minHeight: 100,
        color: COLOURS.textDark,
        textAlignVertical: 'top',
    },

    // Character count text below text area
    charCount: {
        textAlign: 'right',
        paddingHorizontal: 16,
        marginTop: 4,
        color: COLOURS.textLight,
        fontSize: 12,
    },

    // Row containing tick/check items
    tickRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 14,
        gap: 8,
    },

    // Text displayed beside tick icon
    tickText: {
        flex: 1,
        fontSize: 14,
        color: COLOURS.textDark,
    },

    // Main action button styling
    button: {
        backgroundColor: COLOURS.primary,
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 24,
    },

    // Text displayed inside buttons
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },

    // Error message container
    errorBox: {
        backgroundColor: '#FDECEA',
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 16,
    },

    // Error message text styling
    errorText: {
        color: COLOURS.error,
        textAlign: 'center',
        fontSize: 14,
    },

    // Centered content container for empty/loading states
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },

    // Heading text styling
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLOURS.textDark,
        marginTop: 18,
        marginBottom: 10,
        textAlign: 'center',
    },

    // Supporting message text styling
    message: {
        fontSize: 15,
        color: COLOURS.textGrey,
        textAlign: 'center',
        lineHeight: 24,
    },

    // Padding for list content
    listContent: {
        paddingBottom: 30,
    },

    // Card container styling
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLOURS.border,
    },

    // Header section inside cards
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },

    // Text container inside card header
    cardHeaderText: {
        flex: 1,
    },

    // Species name text styling
    speciesName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLOURS.textDark,
    },

    // Additional species details text
    speciesDetails: {
        fontSize: 13,
        color: COLOURS.textGrey,
        marginTop: 2,
    },

    // Information row containing icon and text
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
    },

    // Information text styling
    infoText: {
        flex: 1,
        fontSize: 13,
        color: COLOURS.textGrey,
    },

    // Container for card action buttons
    cardActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
    },

    // Primary update button styling
    updateButton: {
        flex: 1,
        backgroundColor: COLOURS.primary,
        borderRadius: 8,
        paddingVertical: 11,
        alignItems: 'center',
    },

    // Text inside update button
    updateButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

    // Secondary unadopt button styling
    unadoptButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLOURS.error,
        borderRadius: 8,
        paddingVertical: 11,
        alignItems: 'center',
    },

    // Text inside unadopt button
    unadoptButtonText: {
        color: COLOURS.error,
        fontWeight: '600',
    },

    // Empty state container
    emptyBox: {
        alignItems: 'center',
        paddingTop: 80,
    },

    // Empty state text styling
    emptyText: {
        marginTop: 12,
        color: COLOURS.textLight,
        fontSize: 15,
    },

    // Update card styles — for the My Updates section under approved trees
    updateCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLOURS.border,
        overflow: 'hidden',
        flexDirection: 'row',
    },

    // Image displayed on update cards
    updateImage: {
        width: 100,
        height: 100,
    },

    // Main body content inside update cards
    updateBody: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },

    // Tree or item name inside update cards
    updateTreeName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLOURS.textDark,
        marginBottom: 4,
    },

    // Caption or update description text
    updateCaption: {
        fontSize: 13,
        color: COLOURS.textGrey,
        marginBottom: 6,
    },

    // Date text shown on update cards
    updateDate: {
        fontSize: 12,
        color: COLOURS.textLight,
    },
})