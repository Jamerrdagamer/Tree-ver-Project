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

import { supabase } from '../../lib/supabase'
import { COLOURS } from '../../constants/theme'

export default function Login({ navigation }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function validateInputs() {
        if (!email || !password) {
            setError('Please fill in all fields.')
            return false
        }

        if (!email.includes('@')) {
            setError('Please enter a valid email.')
            return false
        }

        return true
    }

    async function handleLogin() {
        setError('')

        if (!validateInputs()) return

        setLoading(true)

        try {
            const { error: signInError } =
                await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

            if (signInError) {
                setError('Incorrect email or password.')
                setLoading(false)
                return
            }

            // success → go to home (change route if needed)
            navigation.replace('Home')

        } catch (err) {
            setError('Something went wrong.')
        }

        setLoading(false)
    }

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.appTitle}>Tree-Ver</Text>

            {error ? (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <Text style={styles.label}>Email Address</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. you@email.com"
                placeholderTextColor={COLOURS.textLight}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor={COLOURS.textLight}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    style={styles.showHideButton}
                    onPress={() => setShowPassword(!showPassword)}
                >
                    <Text style={styles.showHideText}>
                        {showPassword ? 'Hide' : 'Show'}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Log In</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
            >
                <Text style={styles.linkText}>
                    Don't have an account? <Text style={styles.linkHighlight}>Sign up</Text>
                </Text>
            </TouchableOpacity>
        </ScrollView>
    )
}







// CSS - Screen UI for login
const styles = StyleSheet.create({

    // Scrollable screen background
    scrollView: {
        backgroundColor: COLOURS.background,
    },

    // Inner container spacing and layout for scroll
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
        flexGrow: 1,
    },

    // Main app title styling
    appTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: COLOURS.primary,
        textAlign: 'center',
        marginBottom: 8,
    },

    // Section heading styling
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLOURS.textDark,
        textAlign: 'center',
        marginBottom: 8,
    },

    // Smaller descriptive text below heading
    subheading: {
        fontSize: 14,
        color: COLOURS.textGrey,
        textAlign: 'center',
        marginBottom: 32,
    },

    // Container for displaying error messages
    errorBox: {
        backgroundColor: '#FDECEA',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },

    // Error message text styling
    errorText: {
        color: COLOURS.error,
        fontSize: 14,
        textAlign: 'center',
    },

    // Label above input fields
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLOURS.textDark,
        marginBottom: 6,
        marginTop: 16,
    },

    // Standard text input styling
    input: {
        backgroundColor: COLOURS.backgroundSecondary,
        borderWidth: 1,
        borderColor: COLOURS.textLight,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: COLOURS.textDark,
    },

    // Container for password input and show/hide button
    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLOURS.backgroundSecondary,
        borderWidth: 1,
        borderColor: COLOURS.textLight,
        borderRadius: 10,
    },

    passwordInput: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: COLOURS.textDark,
    },

    showHideButton: {
        paddingHorizontal: 14,
    },

    // Text styling for show/hide button
    showHideText: {
        color: COLOURS.primary,
        fontWeight: '600',
        fontSize: 14,
    },

    // Main action button styling
    button: {
        backgroundColor: COLOURS.primary,
        marginTop: 30,
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 16,
    },

    // Text within the button
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },

    // Container for links e.g. 'Forget Password'
    linkRow: {
        marginTop: 8,
        alignItems: 'flex-end',
    },

    // Standard link text styling
    linkText: {
        fontSize: 14,
        color: COLOURS.textGrey,
    },

    // Highlighted clickable part of link text
    linkHighlight: {
        color: COLOURS.primary,
        fontWeight: '600',
    },

})