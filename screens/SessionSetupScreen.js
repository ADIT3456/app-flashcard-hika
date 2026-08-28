import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SessionSetupScreen({ route, navigation }) {
  const initialType = route?.params?.type || 'hiragana';
  const [type, setType] = useState(initialType);
  const [mode, setMode] = useState('sequential'); // 'sequential' | 'random'

  const start = () => {
    navigation.navigate('Flashcard', { type, mode });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pengaturan Belajar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Pilih Kategori</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.chip, type === 'hiragana' && styles.chipActive]}
            onPress={() => setType('hiragana')}
          >
            <Text style={[styles.chipText, type === 'hiragana' && styles.chipTextActive]}>
              Hiragana (46)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, type === 'katakana' && styles.chipActive]}
            onPress={() => setType('katakana')}
          >
            <Text style={[styles.chipText, type === 'katakana' && styles.chipTextActive]}>
              Katakana (46)
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 24 }]}>Urutan Belajar</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.chip, mode === 'sequential' && styles.chipActive]}
            onPress={() => setMode('sequential')}
          >
            <Text style={[styles.chipText, mode === 'sequential' && styles.chipTextActive]}>
              Berurutan (A-I-U-E-O)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, mode === 'random' && styles.chipActive]}
            onPress={() => setMode('random')}
          >
            <Text style={[styles.chipText, mode === 'random' && styles.chipTextActive]}>
              Acak (Shuffle)
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={start} activeOpacity={0.85}>
          <Text style={styles.startText}>Mulai Flashcard 🚀</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  body: { padding: 20 },
  label: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 12 },
  row: { gap: 10 },
  chip: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  chipActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  chipText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#2563eb', fontWeight: '700' },

  startBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
