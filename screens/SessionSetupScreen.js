import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SessionSetupScreen({ route, navigation }) {
  const type = route?.params?.type || 'hiragana';
  const [mode, setMode] = useState('sequential'); // 'sequential' | 'random'

  const title = type === 'hiragana' ? 'Hiragana' : 'Katakana';

  const start = () => {
    navigation.navigate('Flashcard', { type, mode });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title} Session</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>Urutan belajar</Text>

        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'sequential' && styles.toggleActive]}
            onPress={() => setMode('sequential')}
          >
            <Text style={[styles.toggleText, mode === 'sequential' && styles.toggleTextActive]}>
              Berurutan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'random' && styles.toggleActive]}
            onPress={() => setMode('random')}
          >
            <Text style={[styles.toggleText, mode === 'random' && styles.toggleTextActive]}>
              Acak
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={start}>
          <Text style={styles.startText}>Mulai</Text>
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
  body: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 16, color: '#555', marginBottom: 20, fontWeight: '500' },
  toggle: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a73e8',
    overflow: 'hidden',
    marginBottom: 40,
  },
  toggleBtn: { paddingVertical: 12, paddingHorizontal: 32, backgroundColor: '#fff' },
  toggleActive: { backgroundColor: '#1a73e8' },
  toggleText: { fontSize: 15, color: '#1a73e8', fontWeight: '600' },
  toggleTextActive: { color: '#fff' },
  startBtn: {
    backgroundColor: '#1a73e8',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 16,
  },
  startText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
