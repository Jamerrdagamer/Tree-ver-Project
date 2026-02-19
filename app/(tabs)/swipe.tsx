import { Image, StyleSheet, Text, View } from 'react-native';
import Swiper from 'react-native-deck-swiper';

export default function SwipeTrees() {
  const trees = [
    { name: 'Ancient Oak', image: 'https://i.imgur.com/3tY7QEh.png' },
    { name: 'Sacred Cedar', image: 'https://i.imgur.com/0fM3F1Q.png' },
    { name: 'Willow of Healing', image: 'https://i.imgur.com/BtQ2k8y.png' },
    { name: 'Silver Birch', image: 'https://i.imgur.com/4A6z0gJ.png' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌳 Swipe Trees</Text>
      <Swiper
        cards={trees}
        renderCard={(tree) => (
          <View style={styles.card}>
            <Image source={{ uri: tree.image }} style={styles.image} />
            <Text style={styles.treeName}>{tree.name}</Text>
          </View>
        )}
        onSwiped={(cardIndex) => console.log('Swiped card:', cardIndex)}
        onSwipedRight={(cardIndex) => console.log('Liked tree:', trees[cardIndex].name)}
        cardIndex={0}
        backgroundColor="#0f2f23"
        stackSize={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2f23', paddingTop: 20 },
  title: { fontSize: 26, color: '#6ee7b7', textAlign: 'center', marginBottom: 10 },
  card: {
    flex: 0.65,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#6ee7b7',
    backgroundColor: '#123a2c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  treeName: { fontSize: 20, color: '#fff', marginTop: 10, fontWeight: 'bold' },
  image: { width: 250, height: 250, borderRadius: 15 },
});
