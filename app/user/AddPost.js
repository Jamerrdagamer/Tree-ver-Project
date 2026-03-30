import React, { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import * as FileSystem from 'expo-file-system'
import { decode } from 'base64-arraybuffer'
import { supabase } from '../../lib/supabase'
import { COLOURS } from '../../constants/theme'


const PLANT_ID_API_KEY = process.env.EXPO_PUBLIC_PLANT_ID_KEY
const OPENCAGE_API_KEY = process.env.EXPO_PUBLIC_OPENCAGE_KEY



const AVAILABLE_TAGS = [
    { id: 'healthy',  label: 'Healthy',  icon: 'heart' },
    { id: 'broken',   label: 'Broken',   icon: 'tree' },
    { id: 'diseased', label: 'Diseased', icon: 'virus' },
    { id: 'birds',    label: 'Birds',    icon: 'bird' },
    { id: 'insects',  label: 'Insects',  icon: 'bug' },
    { id: 'mammals',  label: 'Mammals',  icon: 'rabbit' },
]


function getTagStyle(tagId, isSelected) {
    if (!isSelected) {
        return { background: COLOURS.backgroundSecondary, text: COLOURS.textGrey }
    }
    if (tagId === 'healthy')  return COLOURS.tagHealthy
    if (tagId === 'broken')   return COLOURS.tagBroken
    if (tagId === 'diseased') return COLOURS.tagDiseased
    if (tagId === 'birds')    return COLOURS.tagBirds
    if (tagId === 'insects')  return COLOURS.tagInsects
    if (tagId === 'mammals')  return COLOURS.tagMammals
    return { background: COLOURS.backgroundSecondary, text: COLOURS.textGrey }
}



function isWithin5Metres(lat1, lng1, lat2, lng2) {
    const latDiff = Math.abs(lat2 - lat1)
    const lngDiff = Math.abs(lng2 - lng1)
    // 0.00005 degrees is roughly 5 metres
    return latDiff < 0.00005 && lngDiff < 0.00005
}

export default function AddPost() {
    const [photo, setPhoto] = useState(null)
    const [location, setLocation] = useState(null)
    const [streetAddress, setStreetAddress] = useState('')
    const [caption, setCaption] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [showPreview, setShowPreview] = useState(false)
    const [matchedTree, setMatchedTree] = useState(null)

    const [speciesName, setSpeciesName] = useState('')
    const [commonName, setCommonName] = useState('')
    const [description, setDescription] = useState('')
    const [userTreeName, setUserTreeName] = useState('')

    async function identifyTreeSpecies(photoUri) {
        try {
            console.log('Calling Plant.id...')
            console.log('Plant key exists:', !!PLANT_ID_API_KEY)

            const imageResponse = await fetch(photoUri)
            const blob = await imageResponse.blob()

            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader()

                reader.onloadend = () => {
                    resolve(reader.result.split(',')[1])
                }

                reader.onerror = reject
                reader.readAsDataURL(blob)
            })

            const plantResponse = await fetch(
                'https://plant.id/api/v3/identification?details=common_names,description',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Api-Key': PLANT_ID_API_KEY,
                    },
                    body: JSON.stringify({
                        images: [base64],
                    }),
                }
            )

            const responseText = await plantResponse.text()

            console.log('Plant.id status:', plantResponse.status)
            console.log('Plant.id raw response:', responseText)

            if (!plantResponse.ok) {
                setSpeciesName('Unknown tree')
                setCommonName('Unknown')
                setDescription('Plant.id could not identify this image.')
                return
            }

            const plantData = JSON.parse(responseText)

            const suggestions = plantData?.result?.classification?.suggestions

            if (suggestions && suggestions.length > 0) {
                const bestGuess = suggestions[0]

                setSpeciesName(bestGuess.name || 'Unknown tree')

                setCommonName(
                    bestGuess.details?.common_names?.[0] ||
                    bestGuess.name ||
                    'Unknown'
                )

                setDescription(
                    bestGuess.details?.description?.value ||
                    bestGuess.details?.description ||
                    'No description available.'
                )
            } else {
                setSpeciesName('Unknown tree')
                setCommonName('Unknown')
                setDescription('The tree could not be identified from the photo.')
            }

        } catch (err) {
            console.log('Plant.id error:', err)

            setSpeciesName('Unknown tree')
            setCommonName('Unknown')
            setDescription('The tree could not be identified, but the post can still be created.')
        }
    }

    async function getStreetAddress(lat, lng) {
        try {
            const response = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${lat},${lng}&key=${OPENCAGE_API_KEY}&limit=1`
            )

            const data = await response.json()

            console.log('OpenCage result:', data)

            if (data.results && data.results.length > 0) {
                const address = data.results[0].formatted

                setStreetAddress(address)


                if (!address.toLowerCase().includes('charlton kings')) {
                    setError('You must be in Charlton Kings to post a tree.')
                    return false
                }

                return true
            }

            setError('Could not find your address. Please try again.')
            return false

        } catch (err) {
            console.log('Address error:', err)
            setError('Could not get your location address.')
            return false
        }
    }

    async function findNearbyTree(lat, lng) {
        const { data, error } = await supabase
            .from('trees')
            .select('*')

        if (error) {
            console.log('Tree check error:', error)
            return null
        }

        let closestTree = null

        if (data) {
            for (const tree of data) {
                if (tree.latitude && tree.longitude) {
                    if (isWithin5Metres(lat, lng, tree.latitude, tree.longitude)) {
                        closestTree = tree
                        break
                    }
                }
            }
        }

        return closestTree
    }

    async function handleTakePhoto() {
        setError('')

        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()

        if (cameraStatus !== 'granted') {
            setError('Camera permission is required to post a tree.')
            return
        }

        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync()

        if (locationStatus !== 'granted') {
            setError('Location permission is required to post a tree.')
            return
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.7,
            allowsEditing: true,
            aspect: [4, 3],
        })

        if (result.canceled) {
            return
        }

        setLoading(true)

        try {
            const gpsLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            })

            const lat = gpsLocation.coords.latitude
            const lng = gpsLocation.coords.longitude

            const addressOk = await getStreetAddress(lat, lng)

            if (!addressOk) {
                setLoading(false)
                return
            }

            const nearbyTree = await findNearbyTree(lat, lng)

            // API can fail, but that is okay because user can type the tree name too
            await identifyTreeSpecies(result.assets[0].uri)

            setPhoto(result.assets[0])
            setLocation({ lat, lng })
            setMatchedTree(nearbyTree)

        } catch (err) {
            console.log('Photo error:', err)
            setError('Something went wrong. Please try again.')
        }

        setLoading(false)
    }

    function handleTagPress(tagId) {
        setSelectedTags(currentTags => {
            if (currentTags.includes(tagId)) {
                return currentTags.filter(tag => tag !== tagId)
            }

            if (tagId === 'healthy') {
                return [
                    ...currentTags.filter(tag => tag !== 'broken' && tag !== 'diseased'),
                    tagId,
                ]
            }

            if (tagId === 'broken' || tagId === 'diseased') {
                return [
                    ...currentTags.filter(tag => tag !== 'healthy'),
                    tagId,
                ]
            }

            return [...currentTags, tagId]
        })
    }

    function validatePost() {
        if (!photo) {
            setError('Please take a photo of the tree first.')
            return false
        }

        if (!location) {
            setError('Location not captured. Please take a photo again.')
            return false
        }

        if (userTreeName === '' && speciesName === 'Unknown tree') {
            setError('Please enter what you think the tree is.')
            return false
        }

        if (selectedTags.length === 0) {
            setError('Please select at least one tag.')
            return false
        }

        if (caption.length > 200) {
            setError('Caption must be 200 characters or less.')
            return false
        }

        return true
    }

    function handleShowPreview() {
        setError('')

        if (!validatePost()) {
            return
        }

        setShowPreview(true)
    }

    async function handleSubmitPost() {
        setSubmitting(true)
        setError('')

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setError('You must be logged in to post.')
                setSubmitting(false)
                return
            }



            const filename = `${user.id}/${Date.now()}.jpg`

            let base64Photo


            if (FileSystem.File) {
                const file = new FileSystem.File(photo.uri)
                base64Photo = await file.base64()
            } else {
                base64Photo = await FileSystem.readAsStringAsync(photo.uri, {
                    encoding: 'base64',
                })
            }
            const arrayBuffer = decode(base64Photo)

            const { error: uploadError } = await supabase.storage
                .from('posts')
                .upload(filename, arrayBuffer, {
                    contentType: 'image/jpeg',
                    upsert: false,
                })

            if (uploadError) {
                console.log('Upload error:', uploadError)
                setError('Failed to upload photo. Please try again.')
                setSubmitting(false)
                return
            }

            const { data: publicData } = supabase.storage
                .from('posts')
                .getPublicUrl(filename)

            const publicUrl = publicData.publicUrl

            let treeId

            const finalTreeName = userTreeName || commonName || speciesName || 'Unknown tree'

            if (matchedTree) {
                await supabase
                    .from('trees')
                    .update({
                        latest_image_url: publicUrl,
                    })
                    .eq('id', matchedTree.id)

                treeId = matchedTree.id

            } else {
                const { data: newTree, error: treeError } = await supabase
                    .from('trees')
                    .insert({
                        species: finalTreeName,
                        common_name: finalTreeName,
                        description: description || 'No description available.',
                        street_address: streetAddress,
                        latitude: location.lat,
                        longitude: location.lng,
                        is_adopted: false,
                        latest_image_url: publicUrl,
                    })
                    .select()
                    .single()

                if (treeError) {
                    console.log('Tree error:', treeError)
                    setError('Failed to create tree record. Please try again.')
                    setSubmitting(false)
                    return
                }

                treeId = newTree.id
            }

            const { error: postError } = await supabase
                .from('posts')
                .insert({
                    user_id: user.id,
                    tree_id: treeId,
                    image_url: publicUrl,
                    caption: caption || null,
                    tags: selectedTags,
                    latitude: location.lat,
                    longitude: location.lng,
                    likes_count: 0,
                })

            if (postError) {
                console.log('Post error:', postError)
                setError('Failed to save post. Please try again.')
                setSubmitting(false)
                return
            }

            // ─────────────────────────────────────────────────────────────────
            // Success — reset everything and show a confirmation
            // ─────────────────────────────────────────────────────────────────
            setPhoto(null)
            setLocation(null)
            setStreetAddress('')
            setCaption('')
            setSelectedTags([])
            setMatchedTree(null)
            setSpeciesName('')
            setCommonName('')
            setDescription('')
            setUserTreeName('')
            setShowPreview(false)
            setError('')

            alert('Post created successfully!')

        } catch (err) {
            console.log('Submit error:', err)
            console.log('Submit error message:', err.message)
            console.log('Submit error stack:', err.stack)
            setError('Something went wrong. Please try again.')
        }

        setSubmitting(false)
    }

    if (showPreview) {
        const finalTreeName = userTreeName || commonName || speciesName || 'Unknown tree'

        return (
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.header} />

                <View style={styles.previewHeadingRow}>
                    <TouchableOpacity onPress={() => setShowPreview(false)}>
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color={COLOURS.textDark}
                        />
                    </TouchableOpacity>

                    <Text style={styles.screenTitle}>Preview Post</Text>

                    <View style={{ width: 24 }} />
                </View>

                {/* Show error on preview screen so submission errors are visible */}
                {error ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                <Image
                    source={{ uri: photo.uri }}
                    style={styles.previewImage}
                    contentFit="cover"
                />

                <View style={styles.speciesBox}>
                    <Text style={styles.speciesName}>{finalTreeName}</Text>

                    <Text style={styles.commonName}>
                        API guess: {commonName || speciesName || 'Unknown'}
                    </Text>

                    <Text style={styles.speciesDescription} numberOfLines={3}>
                        {description}
                    </Text>
                </View>

                <View style={styles.treeMatchBox}>
                    <MaterialCommunityIcons
                        name="tree"
                        size={16}
                        color={COLOURS.primary}
                    />

                    <Text style={styles.treeMatchText}>
                        {matchedTree
                            ? `Linked to existing tree: ${matchedTree.species}`
                            : 'New tree will be created'
                        }
                    </Text>
                </View>

                <View style={styles.tagsRow}>
                    {selectedTags.map(tagId => {
                        const tag = AVAILABLE_TAGS.find(item => item.id === tagId)
                        const tagStyle = getTagStyle(tagId, true)

                        return (
                            <View
                                key={tagId}
                                style={[
                                    styles.tag,
                                    { backgroundColor: tagStyle.background },
                                ]}
                            >
                                <Text style={[
                                    styles.tagText,
                                    { color: tagStyle.text },
                                ]}>
                                    {tag.label}
                                </Text>
                            </View>
                        )
                    })}
                </View>

                {caption ? (
                    <Text style={styles.previewCaption}>{caption}</Text>
                ) : (
                    <Text style={styles.previewNoCaption}>No caption added</Text>
                )}

                <View style={styles.previewLocationRow}>
                    <MaterialCommunityIcons
                        name="map-marker"
                        size={18}
                        color={COLOURS.primary}
                    />

                    <Text style={styles.previewLocation}>
                        {streetAddress || 'Charlton Kings, Cheltenham'}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmitPost}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Confirm and Post</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setShowPreview(false)}
                >
                    <Text style={styles.secondaryButtonText}>Go Back and Edit</Text>
                </TouchableOpacity>

            </ScrollView>
        )
    }

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
        >

            <View style={styles.header} />

            <Text style={styles.screenTitle}>Add Post</Text>

            {error ? (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <Text style={styles.sectionLabel}>Photo</Text>

            {loading ? (
                <View style={styles.cameraButton}>
                    <ActivityIndicator size="large" color={COLOURS.primary} />
                    <Text style={styles.cameraButtonText}>
                        Getting tree and location details...
                    </Text>
                </View>
            ) : photo ? (
                <View style={styles.photoContainer}>
                    <Image
                        source={{ uri: photo.uri }}
                        style={styles.photoPreview}
                        contentFit="cover"
                    />

                    {speciesName ? (
                        <View style={styles.speciesPreviewBox}>
                            <MaterialCommunityIcons
                                name="leaf"
                                size={16}
                                color={COLOURS.primary}
                            />

                            <Text style={styles.speciesPreviewText}>
                                API guess: {speciesName} ({commonName})
                            </Text>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        style={styles.retakeButton}
                        onPress={handleTakePhoto}
                    >
                        <MaterialCommunityIcons
                            name="camera-retake"
                            size={18}
                            color={COLOURS.primary}
                        />

                        <Text style={styles.retakeText}>Retake</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={handleTakePhoto}
                >
                    <MaterialCommunityIcons
                        name="camera"
                        size={40}
                        color={COLOURS.textLight}
                    />

                    <Text style={styles.cameraButtonText}>Tap to take a photo</Text>

                    <Text style={styles.cameraSubText}>
                        The app will also get your location
                    </Text>
                </TouchableOpacity>
            )}

            <Text style={styles.sectionLabel}>Location</Text>

            <View style={styles.locationRow}>
                <MaterialCommunityIcons
                    name="map-marker"
                    size={20}
                    color={location ? COLOURS.primary : COLOURS.textLight}
                />

                <Text style={styles.locationText}>
                    {streetAddress
                        ? streetAddress
                        : location
                            ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
                            : 'Take a photo to capture your location'
                    }
                </Text>
            </View>

            {matchedTree ? (
                <View style={styles.treeMatchBox}>
                    <MaterialCommunityIcons
                        name="tree"
                        size={16}
                        color={COLOURS.primary}
                    />

                    <Text style={styles.treeMatchText}>
                        Existing tree found nearby: {matchedTree.species}
                    </Text>
                </View>
            ) : location ? (
                <View style={styles.treeMatchBox}>
                    <MaterialCommunityIcons
                        name="tree"
                        size={16}
                        color={COLOURS.textGrey}
                    />

                    <Text style={styles.treeMatchText}>
                        No existing tree nearby — a new tree will be created
                    </Text>
                </View>
            ) : null}

            <Text style={styles.sectionLabel}>Tree Name</Text>
            <Text style={styles.sectionHint}>
                Enter what you think the tree is. The API guess is optional.
            </Text>

            <TextInput
                style={styles.input}
                placeholder="e.g. Oak tree"
                placeholderTextColor={COLOURS.textLight}
                value={userTreeName}
                onChangeText={setUserTreeName}
            />

            <Text style={styles.sectionLabel}>Tags</Text>
            <Text style={styles.sectionHint}>
                Select at least one. Healthy cannot be combined with broken or diseased.
            </Text>

            <View style={styles.tagsGrid}>
                {AVAILABLE_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag.id)
                    const tagStyle = getTagStyle(tag.id, isSelected)

                    return (
                        <TouchableOpacity
                            key={tag.id}
                            style={[
                                styles.tagButton,
                                { backgroundColor: tagStyle.background },
                            ]}
                            onPress={() => handleTagPress(tag.id)}
                        >
                            <MaterialCommunityIcons
                                name={tag.icon}
                                size={18}
                                color={tagStyle.text}
                            />

                            <Text style={[
                                styles.tagButtonText,
                                { color: tagStyle.text },
                            ]}>
                                {tag.label}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            <Text style={styles.sectionLabel}>Caption</Text>
            <Text style={styles.sectionHint}>Optional — max 200 characters</Text>

            <TextInput
                style={styles.captionInput}
                placeholder="Describe what you see..."
                placeholderTextColor={COLOURS.textLight}
                value={caption}
                onChangeText={setCaption}
                multiline={true}
                numberOfLines={3}
            />

            <Text style={styles.charCount}>{caption.length}/200</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={handleShowPreview}
            >
                <View style={styles.buttonInner}>
                    <MaterialCommunityIcons
                        name="eye"
                        size={18}
                        color="#FFFFFF"
                    />

                    <Text style={styles.buttonText}>Preview Post</Text>
                </View>
            </TouchableOpacity>

        </ScrollView>
    )


}