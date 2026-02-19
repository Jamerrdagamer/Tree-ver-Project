import { ScrollView, StyleSheet, Text } from 'react-native';

export default function Home() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🌳 The Sacred Grove</Text>
      <Text style={styles.text}>
        Welcome, seeker. You have entered the Grove —
        a sanctuary devoted to wisdom, growth, and balance.
      </Text>

      <Text style={styles.section}>Our Mission</Text>
      <Text style={styles.text}>
        To honor ancient trees, preserve forests,
        and cultivate harmony between humanity and nature.
      </Text>

      <Text style={styles.section}>Core Beliefs</Text>
      <Text style={styles.text}>
        • Growth requires patience{'\n'}
        • Roots define strength{'\n'}
        • All life is interconnected
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0f2f23' },
  title: { fontSize: 28, color: '#6ee7b7', marginBottom: 15 },
  section: { fontSize: 20, color: '#fff', marginTop: 20 },
  text: { fontSize: 16, color: '#d1fae5', marginTop: 8 },
});
