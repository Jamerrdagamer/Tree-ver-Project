import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Adoption() {
  const trees = [
    { name: 'Ancient Oak', description: 'Strong and wise tree, over 200 years old.' },
    { name: 'Sacred Cedar', description: 'Guardian of the forest, known for purification.' },
    { name: 'Willow of Healing', description: 'Provides calm and emotional balance.' },
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
