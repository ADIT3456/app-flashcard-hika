// screens/KatakanaWordsScreen.js
// Latihan Katakana dengan Kata-kata Familiar Serapan (word_examples)

import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { getKatakanaWithExamples } from '../db';

export default function KatakanaWordsScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const items = await getKatakanaWithExamples();
        if (active) {
          setData(items);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error loading katakana words:', err);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const playSound = (text) => {
    Speech.stop();
    Speech.speak(text, { language: 'ja-JP', pitch: 1.0, rate: 0.85 });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ marginTop: 12, color: '#64748b' }}>Memuat kata-kata Katakana...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backBtn}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Katakana & Kata Familiar</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Intro Card */}
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>🔤</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.introTitle}>Katakana Serapan (Gairaigo)</Text>
            <Text style={styles.introDesc}>
              Huruf Katakana paling mudah dihafal lewat kata-kata serapan yang sudah kamu kenal dalam bahasa sehari-hari.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Daftar Huruf & Contoh Kata (46)</Text>
        <Text style={styles.sectionHint}>Ketuk tombol suara 🔊 untuk mendengar pengucapan aslinya.</Text>

        <View style={styles.list}>
          {data.map((item) => (
            <View key={item.key} style={styles.card}>
              {/* Left Column: Big Katakana Char */}
              <TouchableOpacity
                style={styles.charBox}
                onPress={() => playSound(item.char)}
                activeOpacity={0.7}
              >
                <Text style={styles.charText}>{item.char}</Text>
                <Text style={styles.charRomaji}>{item.romaji}</Text>
                <Text style={styles.soundMini}>🔊</Text>
              </TouchableOpacity>

              {/* Right Column: Word Examples */}
              <View style={styles.examplesCol}>
                {item.examples && item.examples.length > 0 ? (
                  item.examples.map((ex, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.exampleRow}
                      onPress={() => playSound(ex.word)}
                      activeOpacity={0.75}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={styles.wordTitleRow}>
                          <Text style={styles.exampleWord}>{ex.word}</Text>
                          <Text style={styles.exampleRomaji}>({ex.romaji})</Text>
                        </View>
                        <Text style={styles.exampleMeaning}>{ex.meaning}</Text>
                      </View>
                      <View style={styles.audioPill}>
                        <Text style={styles.audioPillIcon}>🔊</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noExample}>Contoh belum tersedia</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  body: { padding: 16, paddingBottom: 40 },

  introCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  introEmoji: { fontSize: 32 },
  introTitle: { fontSize: 15, fontWeight: '800', color: '#1e40af', marginBottom: 3 },
  introDesc: { fontSize: 12, color: '#3b82f6', lineHeight: 18 },

  sectionHeader: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  sectionHint: { fontSize: 12, color: '#64748b', marginBottom: 14 },

  list: { gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 14,
  },
  charBox: {
    width: 72,
    height: 80,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    position: 'relative',
  },
  charText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2563eb',
    includeFontPadding: false,
  },
  charRomaji: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  soundMini: { position: 'absolute', top: 3, right: 3, fontSize: 10 },

  examplesCol: { flex: 1, gap: 8 },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  wordTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  exampleWord: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  exampleRomaji: { fontSize: 12, color: '#2563eb', fontWeight: '600' },
  exampleMeaning: { fontSize: 12, color: '#475569', fontWeight: '500' },
  audioPill: {
    backgroundColor: '#dbeafe',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioPillIcon: { fontSize: 14 },
  noExample: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
