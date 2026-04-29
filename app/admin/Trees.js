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

    // Header row with title and count badge
    // flexDirection row puts them side by side
    // alignItems center vertically centres them
    // gap adds space between them
    // marginBottom adds space below before the subtitle
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 4,
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },

    // The tree count badge
    // backgroundColor uses a semi-transparent white
    // borderRadius makes it pill shaped
    countBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 2,
    },

    countBadgeText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 13,
    },

    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
    },

    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
    },

    separator: {
        height: 12,
    },

    // Each tree card
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
    // flexDirection row puts photo, text, and delete button side by side
    // alignItems center vertically centres them
    // marginBottom adds space below before the info rows
    // gap adds space between each element
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 12,
    },

    // The tree thumbnail photo
    // width and height set the size
    // borderRadius rounds the corners
    treeThumb: {
        width: 52,
        height: 52,
        borderRadius: 10,
    },

    // The placeholder shown when no photo is available
    // backgroundColor uses the light blue tint
    // width and height match the thumbnail
    // borderRadius rounds the corners
    // alignItems and justifyContent centre the icon
    treeThumbPlaceholder: {
        width: 52,
        height: 52,
        borderRadius: 10,
        backgroundColor: ADMIN.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // The text block next to the photo
    // flex 1 takes all remaining space
    cardHeaderText: {
        flex: 1,
    },

    // The species name
    // fontWeight bold makes it stand out
    speciesName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: ADMIN.textDark,
        marginBottom: 2,
    },

    // The common name below the species name
    // color uses textGrey for a softer look
    commonName: {
        fontSize: 13,
        color: ADMIN.textGrey,
    },

    // The delete button
    // padding makes it easy to tap
    deleteButton: {
        padding: 4,
    },

    // Each info row showing address or adoption status
    // flexDirection row puts icon and text side by side
    // alignItems center vertically centres them
    // marginBottom adds space between rows
    // gap adds space between icon and text
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 6,
    },

    // The info text
    // color uses textGrey for a softer secondary look
    infoText: {
        fontSize: 13,
        color: ADMIN.textGrey,
        flex: 1,
    },

    // The QR code button
    // flexDirection row puts icon and text side by side
    // alignItems center vertically centres them
    // backgroundColor uses the light blue tint
    // borderRadius makes it pill shaped
    // paddingHorizontal and paddingVertical add space inside
    // alignSelf flex-start stops it stretching full width
    // gap adds space between icon and text
    // marginTop adds space above
    qrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ADMIN.primaryLight,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
        alignSelf: 'flex-start',
        gap: 6,
        marginTop: 6,
    },

    // The QR button text
    qrButtonText: {
        fontSize: 13,
        color: ADMIN.primary,
        fontWeight: '600',
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
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

    // The modal overlay
    // flex 1 fills the entire screen
    // backgroundColor is semi-transparent black
    // justifyContent flex-end pins the modal to the bottom
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },

    // The white modal box
    // borderTopLeftRadius and borderTopRightRadius round the top corners
    // padding adds space inside
    // paddingBottom adds extra space for the home bar
    // alignItems center centres all content horizontally
    modalBox: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 44,
        alignItems: 'center',
    },

    // The modal header row
    // flexDirection row puts title and close button side by side
    // justifyContent space-between pushes them apart
    // alignItems center vertically centres them
    // width 100% makes it fill the full modal width
    // marginBottom adds space below before the species name
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 16,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: ADMIN.textDark,
    },

    // The species name in the modal
    // textAlign center centres it
    // fontWeight bold makes it stand out
    modalSpecies: {
        fontSize: 18,
        fontWeight: 'bold',
        color: ADMIN.textDark,
        textAlign: 'center',
        marginBottom: 2,
    },

    // The common name in the modal
    // textAlign center centres it
    // color uses primary navy
    // marginBottom adds space below before the QR code
    modalCommonName: {
        fontSize: 14,
        color: ADMIN.primary,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 24,
    },

    // The QR code container
    // padding adds space around the QR code
    // backgroundColor gives it a white background
    // borderRadius rounds the corners
    // elevation and shadow add a subtle drop shadow
    // marginBottom adds space below before the info text
    qrContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 4,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        marginBottom: 20,
    },

    // The info text below the QR code
    // textAlign center centres it
    // color uses textGrey for a softer look
    // marginBottom adds space below before the close button
    qrInfoText: {
        fontSize: 13,
        color: ADMIN.textGrey,
        textAlign: 'center',
        marginBottom: 24,
    },

    // The close button at the bottom of the modal
    // backgroundColor uses the navy blue
    // paddingVertical controls the height
    // width 100% makes it fill the full modal width
    // alignItems center centres the text
    closeButton: {
        backgroundColor: ADMIN.primary,
        borderRadius: 12,
        paddingVertical: 14,
        width: '100%',
        alignItems: 'center',
    },

    closeButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },

})