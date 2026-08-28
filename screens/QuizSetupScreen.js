import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuizSetupScreen({ route, navigation }) {
  const defaultCat = route?.params?.category || 'hiragana';
  const [category, setCategory] = useState(defaultCat); // 'hiragana' | 'katakana' | 'all'
  const [questionCount, setQuestionCount] = useState(10); // 10 | 20 | 'all'

  const startQuiz = () => {
    navigation.navigate('QuizPlay', { category, questionCount });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pengaturan Kuis</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Pilih Kategori Karakter</Text>
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[styles.chip, category === 'hiragana' && styles.chipActive]}
            onPress={() => setCategory('hiragana')}
          >
            <Text style={[styles.chipText, category === 'hiragana' && styles.chipTextActive]}>
              Hiragana (46)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, category === 'katakana' && styles.chipActive]}
            onPress={() => setCategory('katakana')}
          >
            <Text style={[styles.chipText, category === 'katakana' && styles.chipTextActive]}>
              Katakana (46)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, category === 'all' && styles.chipActive]}
            onPress={() => setCategory('all')}
          >
            <Text style={[styles.chipText, category === 'all' && styles.chipTextActive]}>
              Campuran (92)
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Jumlah Soal</Text>
        <View style={styles.optionsRow}>
          {[10, 20, 'all'].map((count) => (
            <TouchableOpacity
              key={count}
              style={[styles.chip, questionCount === count && styles.chipActive]}
              onPress={() => setQuestionCount(count)}
            >
              <Text style={[styles.chipText, questionCount === count && styles.chipTextActive]}>
                {count === 'all' ? 'Semua Karakter' : `${count} Soal`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Info Kuis:</Text>
          <Text style={styles.infoDesc}>
            Kamu akan menebak Romaji yang tepat untuk karakter yang ditampilkan. Jawabanmu akan otomatis memperbarui level penguasaan karakter!
          </Text>
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={startQuiz} activeOpacity={0.85}>
          <Text style={styles.startBtnText}>Mulai Kuis 🚀</Text>
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
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 12 },
  optionsRow: { gap: 10, marginBottom: 10 },
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

  infoBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  infoDesc: { fontSize: 13, color: '#475569', lineHeight: 18 },

  startBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
