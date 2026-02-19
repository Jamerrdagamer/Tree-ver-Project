import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Doctrine() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📜 The Teachings</Text>

      <View style={styles.card}>
        <Text style={styles.heading}>🌿 The Five Roots</Text>
        <Text style={styles.text}>
          1. Growth through patience{'\n'}
          2. Strength through unity{'\n'}
          3. Balance with nature{'\n'}
          4. Wisdom in silence{'\n'}
          5. Protection of all life
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>🍂 The Cycle of Seasons</Text>
        <Text style={styles.text}>
          All life moves in cycles. Members embrace change as part of growth,
          just as trees shed leaves to renew themselves.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>🌲 Sacred Oath</Text>
        <Text style={styles.text}>
          “I stand rooted in wisdom, growing toward light,
          protecting the forest within and around me.”
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0f2f23' },
  title: { fontSize: 26, color: '#6ee7b7', marginBottom: 20 },
  card: {
    backgroundColor: '#123a2c',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  heading: { fontSize: 18, color: '#fff', marginBottom: 8 },
  text: { fontSize: 15, color: '#d1fae5' },
});
