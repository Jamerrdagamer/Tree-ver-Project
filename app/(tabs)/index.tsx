/*
index.tsx - Home Screen for Tree-ver App
Author: JH

1.00 JH  Initial release with basic home screen content and styling.
*/

import { ScrollView, StyleSheet, Text } from 'react-native';

export default function Home() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🌳 Tree-Ver</Text>
      <Text style={styles.text}>
        Tree-ver is a community-powered app designed to help people discover, protect, and care for the trees around them. Our mission is to make it easy and engaging for everyone — from children to adults — to connect with local trees and play an active role in supporting urban nature.
      </Text>

      <Text style={styles.section}>Our Mission</Text>
      <Text style={styles.text}>
        Through Tree-ver, users can explore trees in their area, learn about different species, and contribute valuable information to a growing shared database. Each tree profile includes details such as its type, estimated age, size, location, planting history, and current health. Users can also upload photos, record wildlife sightings, report signs of disease, and leave notes.
      </Text>
      <Text style={styles.section}>Adop me</Text>
      <Text style={styles.text}>
        Tree-ver encourages people to “adopt” a tree, track its wellbeing over time, and invite friends to get involved. By making tree care interactive and accessible on mobile devices, the app helps build curiosity, environmental awareness, and long-term community engagement.
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
