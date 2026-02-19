/*
explore.tsx - Explore Screen for Tree-ver App
Author: JH

1.00 JH Initial release with sacred trees content and styling.
*/

import { ScrollView, StyleSheet, Text } from 'react-native';

export default function Explore() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.tree}>Common Oak</Text>
      <Text style={styles.description}>
        Large, long-lived, native deciduous tree growing up to 40m tall with a broad, spreading crown and rugged, fissured bark.
      </Text>

      <Text style={styles.tree}>Beech</Text>
      <Text style={styles.description}>
        A large, deciduous tree, reaching up to 40 meters in height with a dense, spreading crown
       </Text>

      <Text style={styles.tree}>Ash</Text>
      <Text style={styles.description}>
        Smooth, greenish-grey bark that fissures with age, distinct black winter buds, and pinnately compound leaves.
      </Text>

      <Text style={styles.tree}>Field Maple</Text>
      <Text style={styles.description}>
        A small-to-medium, deciduous, native British tree (up to 20m) often found in hedgerows and woodlands.
      </Text>

        <Text style={styles.tree}>Hazel</Text> 
      <Text style={styles.description}>
        A small, deciduous, multi-stemmed shrub or tree native to Europe, Asia, and North Africa, often found in woodland understories.
      </Text>
      
      <Text style={styles.tree}>Wild Cherry</Text> 
      <Text style={styles.description}>
        Fast-growing, deciduous native tree known for its smooth, peeling reddish-brown bark with horizontal, creamy-white lenticels.
      </Text>

      <Text style={styles.tree}>Alder</Text>
      <Text style={styles.description}>
        Fast-growing, deciduous tree often found in wet, boggy areas or along riverbanks.
      </Text>

      <Text style={styles.tree}>Hornbeam</Text>
      <Text style={styles.description}>
        Smooth, grey, "muscular" or fluted trunk and incredibly hard timber.
      </Text>

      <Text style={styles.tree}>London Plane</Text>
      <Text style={styles.description}>
        A massive, long-lived deciduous tree (30–40m) renowned for its mottled, exfoliating bark—patterned in grey, green, and white—and high tolerance for pollution and urban conditions.
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
