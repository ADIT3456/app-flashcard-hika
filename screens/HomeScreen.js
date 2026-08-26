import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import hiraganaData from '../data/hiragana';
import katakanaData from '../data/katakana';

const HiraganaSvg = hiraganaData[0].svg;
const KatakanaSvg = katakanaData[0].svg;

export default function HomeScreen({ navigation }) {
  const goToSetup = (type) => {
    navigation.navigate('Practice', {
      screen: 'SessionSetup',
      params: { type },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Flashcard</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.welcome}>Welcome back</Text>
        <Text style={styles.subtitle}>Choose your study path for today.</Text>

        {/* Hiragana card */}
        <TouchableOpacity style={styles.card} onPress={() => goToSetup('hiragana')} activeOpacity={0.85}>
          {HiraganaSvg ? <HiraganaSvg width="85%" height="85%" preserveAspectRatio="xMidYMid meet" /> : <Text style={styles.fallback}>あ</Text>}
          <Text style={styles.cardLabel}>Hiragana</Text>
        </TouchableOpacity>

        {/* Katakana card */}
        <TouchableOpacity style={styles.card} onPress={() => goToSetup('katakana')} activeOpacity={0.85}>
          {KatakanaSvg ? <KatakanaSvg width="85%" height="85%" preserveAspectRatio="xMidYMid meet" /> : <Text style={styles.fallback}>ア</Text>}
          <Text style={styles.cardLabel}>Katakana</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f7fb' },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1a73e8' },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
  welcome: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardLabel: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 12 },
  fallback: { fontSize: 80, color: '#1a73e8' },
});
