import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Rituals() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔥 Sacred Rituals</Text>

      <View style={styles.card}>
        <Text style={styles.ritual}>🌅 Sunrise Gathering</Text>
        <Text style={styles.description}>
          Members gather at dawn to greet the light through silent meditation
          beneath the trees.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.ritual}>🌕 Full Moon Ceremony</Text>
        <Text style={styles.description}>
          A night ritual honoring the moon’s guidance. Members reflect on growth,
          release burdens, and renew vows to the Grove.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.ritual}>🌱 Tree Planting Rite</Text>
        <Text style={styles.description}>
          Initiates plant a young tree as a symbol of their commitment to
          preservation and balance.
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
  ritual: { fontSize: 18, color: '#fff', marginBottom: 5 },
  description: { fontSize: 15, color: '#d1fae5' },
});
