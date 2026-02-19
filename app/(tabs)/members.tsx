import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Members() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>👥 The Grove Members</Text>

      <View style={styles.card}>
        <Text style={styles.role}>🌳 High Elder</Text>
        <Text style={styles.description}>
          The spiritual guide of the Grove. Keeper of ancient wisdom and
          protector of sacred traditions.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.role}>🌲 Grove Keepers</Text>
        <Text style={styles.description}>
          Dedicated members who maintain rituals, organize gatherings,
          and oversee the preservation of forests.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.role}>🌱 Initiates</Text>
        <Text style={styles.description}>
          New members learning the teachings and planting their first tree
          as a symbol of commitment.
        </Text>
      </View>
    

          <View style={styles.card}>
        <Text style={styles.role}>😘 Tree Lover</Text>
        <Text style={styles.description}>
          Ones who have a special connection with trees and are known for their
          unique ability to communicate with them on a deeper level.
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
  role: { fontSize: 18, color: '#fff', marginBottom: 5 },
  description: { fontSize: 15, color: '#d1fae5' },
});
