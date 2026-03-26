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
import { COLOURS } from '../../constants/theme'
import { supabase } from '../../lib/supabase'
export default function Register({ navigation }) {

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')


    function validateInputs() {
        // register checks

        if (username === '') {
            setError('Please enter a username.')
            return false
        }

        if (username.length > 20) {
            setError('Username must be 20 characters or less.')
            return false
        }

        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            setError('Username can only contain letters and numbers.')
            return false
        }

        if (email === '') {
            setError('Please enter an email address.')
            return false
        }

        if (password === '') {
            setError('Please enter a password.')
            return false
        }

        if (password.length < 7) {
            setError('Password must be at least 7 characters long.')
            return false
        }

        if (confirmPassword === '') {
            setError('Please confirm your password.')
            return false
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return false
        }

        return true
    }


    async function handleRegister() {
        setError('')

        if (!validateInputs()) {
            return
        }

        setLoading(true)

        try {
            // check if username already exists
            const { data: existingUser } = await supabase
                .from('profiles')
                .select('username')
                .ilike('username', username)
                .single()

            if (existingUser) {
                setError('Username already taken.')
                setLoading(false)
                return
            }

            // create account
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: password,
            })

            if (signUpError) {
                setError(signUpError.message)
                setLoading(false)
                return
            }

            // save username in profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    username: username,
                    is_admin: false,
                })

            if (profileError) {
                setError('Something went wrong saving profile.')
                setLoading(false)
                return
            }

            // go to login screen after success
            navigation.navigate('Login')

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

            <Text style={styles.heading}>Create Account</Text>

            {error? (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <Text style={styles.label}>Username</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. TreeLover123"
                placeholderTextColor={COLOURS.textLight}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                maxLength={20}
            />

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
                    placeholder="At least 7 characters"
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

            <Text style={styles.hint}>
                Must be at least 7 characters
            </Text>

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordRow}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password again"
                    placeholderTextColor={COLOURS.textLight}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    style={styles.showHideButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                    <Text style={styles.showHideText}>
                        {showConfirmPassword ? 'Hide' : 'Show'}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkRow}
                onPress={() => navigation.navigate('Login')}
            >
                <Text style={styles.linkText}>
                    Already have an account?{' '}
                    <Text style={styles.linkHighlight}>Log in</Text>
                </Text>
            </TouchableOpacity>

        </ScrollView>
    )
}


// Creates a stylesheet object for the screen UI
const styles = StyleSheet.create({

    // Main scrollable screen background
    scrollView: {
        backgroundColor: COLOURS.background,
    },

    // Inner content container spacing and layout
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
        flexGrow: 1,
    },

    // Main application title styling
    appTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: COLOURS.primary,
        textAlign: 'center',
        marginBottom: 8,
    },

    // Main page heading styling
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLOURS.textDark,
        textAlign: 'center',
        marginBottom: 8,
    },

    // Container used to display error messages
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

    // Label displayed above form inputs
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

    // Container for password input and visibility toggle
    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLOURS.backgroundSecondary,
        borderWidth: 1,
        borderColor: COLOURS.textLight,
        borderRadius: 10,
    },

    // Password input field styling
    passwordInput: {
        flex: 1, // Takes remaining space
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: COLOURS.textDark,
    },

    // Show/hide password button container
    showHideButton: {
        paddingHorizontal: 14,
    },

    // Show/hide password button text styling
    showHideText: {
        color: COLOURS.primary,
        fontWeight: '600',
        fontSize: 14,
    },

    // Small helper or hint text styling
    hint: {
        fontSize: 12,
        color: COLOURS.textLight,
    },

    // Main action button styling
    button: {
        backgroundColor: COLOURS.primary,
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
    },

    // Text displayed inside buttons
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },

    // Container for links such as "Forgot Password?"
    linkRow: {
        alignItems: 'flex-end',
    },

// Standard link text styling
linkText: {
        color: COLOURS.textGrey,
    },

    // Highlighted clickable link text
    linkHighlight: {
        color: COLOURS.primary,
    },

})