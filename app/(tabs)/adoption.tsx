/*
adoption.tsx - Tree Adoption Screen for Tree-ver App
Author: JH

1.00 JH Initial release with tree adoption functionality and styling.
*/

import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Adoption() {
  const trees = [
  { name:'Common Oak', description: 'Large, long-lived, native deciduous tree growing up to 40m tall with a broad, spreading crown and rugged, fissured bark.' },
  { name:'Beech', description: 'A large, deciduous tree, reaching up to 40 meters in height with a dense, spreading crown.' },
  { name:'Ash', description: 'Smooth, greenish-grey bark that fissures with age, distinct black winter buds, and pinnately compound leaves.' },
  { name:'Field Maple', description: 'A small-to-medium, deciduous, native British tree (up to 20m) often found in hedgerows and woodlands.' },
  { name:'Hazel', description: 'A small, deciduous, multi-stemmed shrub or tree native to Europe, Asia, and North Africa, often found in woodland understories.' },
  { name:'Wild Cherry', description: 'Fast-growing, deciduous native tree known for its smooth, peeling reddish-brown bark with horizontal, creamy-white lenticels.' },
  { name:'Alder', description: 'Fast-growing, deciduous tree often found in wet, boggy areas or along riverbanks.' },
  { name:'Hornbeam', description: 'Smooth, grey, "muscular" or fluted trunk and incredibly hard timber.' },
  { name:'London Plane', description: 'A massive, long-lived deciduous tree (30–40m) renowned for its mottled, exfoliating bark—patterned in grey, green, and white—and high tolerance for pollution and urban conditions.' },
  { name:'Cypress Oak', description: 'Narrow, upright, broom-like, or pyramidal growth habit.' },
  ];


  

  const handleAdopt = (treeName: string) => {
    Alert.alert('Adoption Successful', `You have adopted the ${treeName}! 🌳`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🌱 Adopt a Tree</Text>
      <Text style={styles.subtitle}>
        Choose a tree to nurture and pledge your care to the Grove.
      </Text>

      {trees.map((tree, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.treeName}>{tree.name}</Text>
          <Text style={styles.description}>{tree.description}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleAdopt(tree.name)}
          >
            <Text style={styles.buttonText}>Adopt</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0f2f23' },
  title: { fontSize: 26, color: '#6ee7b7', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#d1fae5', marginBottom: 20 },
  card: { backgroundColor: '#123a2c', padding: 15, borderRadius: 10, marginBottom: 15 },
  treeName: { fontSize: 18, color: '#fff', marginBottom: 5 },
  description: { fontSize: 15, color: '#d1fae5', marginBottom: 10 },
  button: { backgroundColor: '#6ee7b7', padding: 10, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#0f2f23', fontWeight: 'bold', fontSize: 16 },
});
