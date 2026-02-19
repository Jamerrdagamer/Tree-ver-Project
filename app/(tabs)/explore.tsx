import { ScrollView, StyleSheet, Text } from 'react-native';

export default function Explore() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sacred Trees</Text>

      <Text style={styles.tree}>🌳 The Oak</Text>
      <Text style={styles.description}>
        Symbol of endurance and ancient wisdom.
      </Text>

      <Text style={styles.tree}>🌲 The Cedar</Text>
      <Text style={styles.description}>
        Protector tree, representing strength and purification.
      </Text>

      <Text style={styles.tree}>🌿 The Willow</Text>
      <Text style={styles.description}>
        Tree of intuition and emotional healing.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0f2f23' },
  title: { fontSize: 26, color: '#6ee7b7', marginBottom: 20 },
  tree: { fontSize: 20, color: '#fff', marginTop: 15 },
  description: { fontSize: 16, color: '#d1fae5', marginTop: 5 },
});
