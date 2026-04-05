import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { COLOURS } from '../../constants/theme'

// starting point for the map
const START_REGION = {
    latitude: 51.8893,
    longitude: -2.0590,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
}

export default function Map() {
    const [trees, setTrees] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedTree, setSelectedTree] = useState(null)

    useEffect(() => {
        getTrees()
    }, [])

    async function getTrees() {
        try {
            // get all trees and guardian username if it has one
            const { data, error } = await supabase
                .from('trees')
                .select(`
                *,
                profiles:guardian_id (
                    username
                )
            `)

            if (error) {
                console.log('Tree error:', error)
                setLoading(false)
                return
            }

            setTrees(data || [])

        } catch (err) {
            console.log('Something went wrong:', err)
        }

        setLoading(false)
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header} />

                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLOURS.primary} />
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>

            <View style={styles.header} />

            <MapView
                style={styles.map}
                initialRegion={START_REGION}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {trees.map(tree => (
                    <Marker
                        key={tree.id}
                        coordinate={{
                            latitude: tree.latitude,
                            longitude: tree.longitude,
                        }}
                        onPress={() => setSelectedTree(tree)}
                        pinColor={tree.is_adopted ? '#E74C3C' : COLOURS.primary}
                    />
                ))}
            </MapView>

            <View style={styles.legend}>
                <View style={styles.legendRow}>
                    <MaterialCommunityIcons
                        name="map-marker"
                        size={20}
                        color={COLOURS.primary}
                    />
                    <Text style={styles.legendText}>Tree</Text>
                </View>

                <View style={styles.legendRow}>
                    <MaterialCommunityIcons
                        name="map-marker"
                        size={20}
                        color="#E74C3C"
                    />
                    <Text style={styles.legendText}>Adopted</Text>
                </View>
            </View>

            {selectedTree ? (
                <View style={styles.infoPanel}>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setSelectedTree(null)}
                    >
                        <MaterialCommunityIcons
                            name="close"
                            size={22}
                            color={COLOURS.textGrey}
                        />
                    </TouchableOpacity>

                    <View style={styles.infoPanelHeader}>
                        <MaterialCommunityIcons
                            name="tree"
                            size={28}
                            color={COLOURS.primary}
                        />

                        <Text style={styles.infoSpecies}>
                            {selectedTree.species || 'Unknown tree'}
                        </Text>
                    </View>

                    {selectedTree.is_adopted ? (
                        <View style={styles.adoptedRow}>
                            <MaterialCommunityIcons
                                name="shield-account"
                                size={18}
                                color={COLOURS.primary}
                            />

                            <Text style={styles.adoptedLabel}>Adopted by </Text>

                            <Text style={styles.adoptedUsername}>
                                {selectedTree.profiles?.username || 'Guardian'}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.adoptedRow}>
                            <MaterialCommunityIcons
                                name="tree"
                                size={18}
                                color={COLOURS.textGrey}
                            />

                            <Text style={styles.notAdoptedText}>Not yet adopted</Text>
                        </View>
                    )}

                </View>
            ) : null}

        </View>
    )
}


// STYLES

const styles = StyleSheet.create({

    // The main container filling the whole screen
    // flex 1 makes it fill the entire screen height
    container: {
        flex: 1,
        backgroundColor: COLOURS.background,
    },

    // The thin green strip at the very top
    // paddingTop clears the phone notch
    // paddingBottom controls how thick the bar is
    header: {
        backgroundColor: COLOURS.primary,
        paddingTop: 50,
        paddingBottom: 6,
    },

    // Loading spinner container
    // flex 1 fills all remaining space
    // alignItems and justifyContent centre the spinner
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // The map view filling all remaining space below the header
    // flex 1 makes it stretch to fill everything
    map: {
        flex: 1,
    },

    // The legend box floating in the top right corner
    // position absolute lifts it out of the normal layout
    // top positions it just below the header
    // right pins it to the right edge
    // backgroundColor gives it a white background
    // borderRadius rounds the corners
    // padding adds space inside
    // elevation and shadow add a subtle drop shadow
    legend: {
        position: 'absolute',
        top: 70,
        right: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 10,
        elevation: 4,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },

    // Each row inside the legend
    // flexDirection row puts the icon and label side by side
    // alignItems center vertically centres them
    // marginBottom adds space between rows
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },

    // The label text next to each icon
    // marginLeft adds space between the icon and text
    legendText: {
        fontSize: 13,
        color: COLOURS.textDark,
        fontWeight: '600',
        marginLeft: 4,
    },

    // The info panel at the bottom when a marker is tapped
    // position absolute pins it to the bottom of the screen
    // left 0 and right 0 make it stretch the full width
    // backgroundColor gives it a white background
    // borderTopLeftRadius and borderTopRightRadius round the top corners
    // padding adds space inside
    // paddingBottom adds extra space for the home bar
    // elevation and shadow add a drop shadow above the panel
    infoPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },

    // The close button in the top right of the info panel
    // position absolute positions it in the top right corner
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
    },

    // The row containing the tree icon and species name
    // flexDirection row puts them side by side
    // alignItems center vertically centres them
    // marginBottom adds space below
    // gap adds space between the icon and text
    infoPanelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8,
    },

    // The tree species name in the info panel
    // fontWeight bold makes it stand out
    infoSpecies: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLOURS.textDark,
    },

    // The adoption status row
    // flexDirection row puts the icon and text side by side
    // alignItems center vertically centres them
    adoptedRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // The Adopted by label text
    // color uses textGrey for a softer secondary look
    adoptedLabel: {
        fontSize: 15,
        color: COLOURS.textGrey,
    },

    // The guardian username
    // color uses the primary green to make it stand out
    // fontWeight 600 makes it slightly bold
    adoptedUsername: {
        fontSize: 15,
        color: COLOURS.primary,
        fontWeight: '600',
    },

    // The Not yet adopted text
    // color uses textGrey for a softer secondary look
    notAdoptedText: {
        fontSize: 15,
        color: COLOURS.textGrey,
    },

})