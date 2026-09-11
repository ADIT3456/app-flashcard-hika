// screens/Kotoba/MinnaChapterDetailScreen.js
// Menampilkan Daftar Kosakata & Contoh Kalimat per Bab Minna no Nihongo

import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { getVocabItems, getProgressMap } from '../../db';
import { MASTERY_CONFIG } from '../../utils/mastery';

export default function MinnaChapterDetailScreen({ route, navigation }) {
  const unitId = route?.params?.unitId;
  const bab = route?.params?.bab || 'Bab';
  const title = route?.params?.title || 'Detail Bab';

  const [words, setWords] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [items, pMap] = await Promise.all([
        getVocabItems(unitId, 'sequential'),
        getProgressMap('vocab'),
      ]);
      setWords(items);
      setProgressMap(pMap || {});
    } catch (err) {
      console.warn('Error loading chapter words:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [unitId]);

  const playAudio = (text) => {
    Speech.stop();
    Speech.speak(text, { language: 'ja-JP', pitch: 1.0, rate: 0.85 });
  };

  const startFlashcard = (mode = 'sequential') => {
    navigation.navigate('MinnaFlashcard', {
      unitId,
      bab,
      title,
      mode,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Memuat materi {bab}...</Text>
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
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerBab}>{bab}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Banner Action Flashcard */}
        <View style={styles.actionBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Latihan Flashcard {bab}</Text>
            <Text style={styles.bannerSubtitle}>{words.length} kosakata dasar dengan contoh kalimat</Text>
          </View>
          <View style={styles.bannerBtnRow}>
            <TouchableOpacity
              style={styles.fcBtn}
              onPress={() => startFlashcard('sequential')}
              activeOpacity={0.85}
            >
              <Text style={styles.fcBtnText}>Mulai 🎴</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.fcBtn, styles.fcBtnAlt]}
              onPress={() => startFlashcard('random')}
              activeOpacity={0.85}
            >
              <Text style={styles.fcBtnAltText}>Acak 🔀</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tes Bab Ini */}
        <TouchableOpacity
          style={styles.quizBanner}
          onPress={() => navigation.navigate('MinnaQuiz', { unitId, bab, title })}
          activeOpacity={0.85}
        >
          <Text style={styles.quizBannerIcon}>📝</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.quizBannerTitle}>Tes {bab}</Text>
            <Text style={styles.quizBannerDesc}>Uji hafalan kosakata dengan soal pilihan ganda</Text>
          </View>
          <Text style={styles.quizBannerArrow}>→</Text>
        </TouchableOpacity>

        <Text style={styles.sectionHeader}>Daftar Kosakata ({words.length})</Text>

        <View style={styles.wordList}>
          {words.map((w, idx) => {
            const p = progressMap[w.key];
            const status = p?.status || 'new';
            const mConfig = MASTERY_CONFIG[status === 'new' ? 'unlearned' : status];

            return (
              <View key={w.id} style={styles.wordCard}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.wordLine}>
                      <Text style={styles.wordText}>{w.word}</Text>
                      <Text style={styles.readingText}>[{w.reading}]</Text>
                    </View>
                    <Text style={styles.meaningText}>{w.meaning_id}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.soundBtn}
                    onPress={() => playAudio(w.word)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.soundIcon}>🔊</Text>
                  </TouchableOpacity>
                </View>

                {w.example_sentence ? (
                  <View style={styles.exampleContainer}>
                    <TouchableOpacity
                      style={styles.sentenceRow}
                      onPress={() => playAudio(w.example_sentence)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.exampleSentence}>例: {w.example_sentence}</Text>
                      <Text style={styles.exampleMiniSound}>🔊</Text>
                    </TouchableOpacity>
                    <Text style={styles.exampleTranslation}>{w.example_translation}</Text>
                  </View>
                ) : null}

                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: mConfig.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: mConfig.color }]}>
                    {mConfig.badge} {mConfig.label}
                  </Text>
                </View>
              </View>
            );
          })}
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
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  headerBab: { fontSize: 12, color: '#2563eb', fontWeight: '800' },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', maxWidth: 220 },
  body: { padding: 16, paddingBottom: 40 },

  actionBanner: {
    backgroundColor: '#eff6ff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  bannerTitle: { fontSize: 16, fontWeight: '800', color: '#1e40af', marginBottom: 2 },
  bannerSubtitle: { fontSize: 12, color: '#3b82f6', marginBottom: 14 },
  bannerBtnRow: { flexDirection: 'row', gap: 10 },
  fcBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  fcBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  fcBtnAlt: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#2563eb',
  },
  fcBtnAltText: { color: '#2563eb', fontSize: 14, fontWeight: '700' },

  sectionHeader: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  wordList: { gap: 12 },
  wordCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  wordLine: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 4 },
  wordText: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  readingText: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
  meaningText: { fontSize: 15, fontWeight: '700', color: '#334155' },

  soundBtn: {
    backgroundColor: '#eff6ff',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundIcon: { fontSize: 16 },

  exampleContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  sentenceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exampleSentence: { fontSize: 14, fontWeight: '600', color: '#1e293b', flex: 1 },
  exampleMiniSound: { fontSize: 12, marginLeft: 6 },
  exampleTranslation: { fontSize: 12, color: '#64748b', marginTop: 2 },

  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },

  quizBanner: {
    backgroundColor: '#fdf4ff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#e9d5ff',
  },
  quizBannerIcon: { fontSize: 26 },
  quizBannerTitle: { fontSize: 14, fontWeight: '800', color: '#7c3aed', marginBottom: 2 },
  quizBannerDesc: { fontSize: 12, color: '#6d28d9' },
  quizBannerArrow: { fontSize: 18, fontWeight: '800', color: '#7c3aed' },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748b' },
});

