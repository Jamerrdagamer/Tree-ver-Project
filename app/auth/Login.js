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


    async function handleLogin() {
        setError('')

        if (!validateInputs()) {
            return
        }

        setLoading(true)

        try {
            // log in using Supabase
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            })

            if (signInError) {
                setError('Incorrect email or password.')
                setLoading(false)
                return
            }


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
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.buttonText}>Log In</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkRow}
                onPress={() => navigation.navigate('Register')}
            >
                <Text style={styles.linkText}>
                    Don't have an account?{' '}
                    <Text style={styles.linkHighlight}>Sign up</Text>
                </Text>
            </TouchableOpacity>

        </ScrollView>
    )
}


