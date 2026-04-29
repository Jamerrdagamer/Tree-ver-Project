import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Modal,
    Alert,
    Image,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import QRCode from 'react-native-qrcode-svg'
import { supabase } from '../../lib/supabase'
import { ADMIN_COLOURS as ADMIN } from '../../constants/theme'

export default function Trees() {

    const [trees, setTrees] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedTree, setSelectedTree] = useState(null)
    const [showQRModal, setShowQRModal] = useState(false)


    useEffect(() => {
        fetchTrees()
    }, [])

    async function fetchTrees() {
        try {
            const { data, error } = await supabase
                .from('trees')
                .select(`
                    *,
                    profiles:guardian_id (
                        username
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching trees:', error)
                return
            }

            setTrees(data || [])

        } catch (err) {
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }


    async function handleDeleteTree(tree) {
        Alert.alert(
            'Delete Tree',
            `Are you sure you want to delete this ${tree.species || 'tree'}? All posts linked to it will also be deleted.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {

                            await supabase
                                .from('posts')
                                .delete()
                                .eq('tree_id', tree.id)


                            await supabase
                                .from('trees')
                                .delete()
                                .eq('id', tree.id)


                            setTrees(current => current.filter(t => t.id !== tree.id))

                        } catch (err) {
                            console.error('Error deleting tree:', err)
                        }
                    }
                }
            ]
        )
    }


    function handleShowQR(tree) {
        setSelectedTree(tree)
        setShowQRModal(true)
    }


    function buildQRData(tree) {
        const adoptedText = tree.is_adopted
            ? `Adopted by: ${tree.profiles?.username || 'Guardian'}`
            : 'Adopted by: Not adopted yet'

        const treeInfo = [
            `Tree-Vor Tree Information`,
            ``,
            `Species: ${tree.species || 'Unknown species'}`,
            `Location: ${tree.street_address || 'No location saved'}`,
            adoptedText,
            ``,
            `Description:`,
            tree.description || 'No description available.',
        ]

        return treeInfo.join('\n')
    }


    function renderTree({ item }) {
        return (
            <View style={styles.card}>


                <View style={styles.cardHeader}>


                    {item.latest_image_url ? (
                        <Image
                            source={{ uri: item.latest_image_url }}
                            style={styles.treeThumb}
                        />
                    ) : (
                        <View style={styles.treeThumbPlaceholder}>
                            <MaterialCommunityIcons
                                name="tree"
                                size={28}
                                color={ADMIN.primary}
                            />
                        </View>
                    )}


                    <View style={styles.cardHeaderText}>
                        <Text style={styles.speciesName} numberOfLines={1}>
                            {item.species || 'Unknown species'}
                        </Text>
                    </View>


                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteTree(item)}
                    >
                        <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={20}
                            color={ADMIN.error}
                        />
                    </TouchableOpacity>

                </View>

                {/* ── Street address ── */}
                <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                        name="map-marker"
                        size={15}
                        color={ADMIN.textLight}
                    />
                    <Text style={styles.infoText}>
                        {item.street_address || 'Charlton Kings, Cheltenham'}
                    </Text>
                </View>


                {item.is_adopted ? (
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons
                            name="shield-account"
                            size={15}
                            color={ADMIN.success}
                        />
                        <Text style={[styles.infoText, { color: ADMIN.success }]}>
                            Adopted by {item.profiles?.username || 'Guardian'}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons
                            name="shield-outline"
                            size={15}
                            color={ADMIN.textLight}
                        />
                        <Text style={styles.infoText}>Not yet adopted</Text>
                    </View>
                )}


                <TouchableOpacity
                    style={styles.qrButton}
                    onPress={() => handleShowQR(item)}
                >
                    <MaterialCommunityIcons
                        name="qrcode"
                        size={16}
                        color={ADMIN.primary}
                    />
                    <Text style={styles.qrButtonText}>Show QR Code</Text>
                </TouchableOpacity>

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
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Trees</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{trees.length}</Text>
                    </View>
                </View>
                <Text style={styles.headerSubtitle}>
                    All trees mapped in Charlton Kings
                </Text>
            </View>

            <FlatList
                data={trees}
                keyExtractor={item => item.id}
                renderItem={renderTree}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons
                            name="tree"
                            size={64}
                            color={ADMIN.textLight}
                        />
                        <Text style={styles.emptyTitle}>No trees yet</Text>
                        <Text style={styles.emptyMessage}>
                            Trees will appear here when users post them.
                        </Text>
                    </View>
                )}
            />


            <Modal
                visible={showQRModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowQRModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>


                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>QR Code</Text>
                            <TouchableOpacity onPress={() => setShowQRModal(false)}>
                                <MaterialCommunityIcons
                                    name="close"
                                    size={22}
                                    color={ADMIN.textGrey}
                                />
                            </TouchableOpacity>
                        </View>


                        <Text style={styles.modalSpecies}>
                            {selectedTree?.species || 'Unknown species'}
                        </Text>
                        <Text style={styles.modalCommonName}>
                            {selectedTree?.common_name || ''}
                        </Text>


                        {selectedTree ? (
                            <View style={styles.qrContainer}>
                                <QRCode
                                    value={buildQRData(selectedTree)}
                                    size={220}
                                    color={ADMIN.textDark}
                                    backgroundColor="#FFFFFF"
                                />
                            </View>
                        ) : null}


                        <Text style={styles.qrInfoText}>
                            Scan this code to see information about this tree
                        </Text>


                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowQRModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>

        </View>
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