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