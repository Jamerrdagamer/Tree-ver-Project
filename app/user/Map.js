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
