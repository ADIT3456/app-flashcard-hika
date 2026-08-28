import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { ALL_KOTOBA, getKotobaById } from '../../data/kotoba';
import {
  getNamespaceData,
  getFavoritesList,
  toggleFavorite,
  recordMasteryRecords,
  calculateMastery,
  MASTERY_CONFIG,
} from '../../utils/mastery';

export default function KotobaDetailScreen({ route, navigation }) {
  const initialWordId = route?.params?.wordId || 'kt-001';
  const [currentId, setCurrentId] = useState(initialWordId);
  const [isFav, setIsFav] = useState(false);
  const [masteryStats, setMasteryStats] = useState(null);

  const word = getKotobaById(currentId) || ALL_KOTOBA[0];
  const currentIndex = ALL_KOTOBA.findIndex((w) => w.id === word.id);

  const loadWordData = async (id) => {
    const favs = await getFavoritesList();
    const masteryData = await getNamespaceData('kotoba');
    setIsFav(!!favs[id]);
    setMasteryStats(masteryData[id] || null);
  };

  useEffect(() => {
    loadWordData(word.id);
  }, [word.id]);

  const handleToggleFav = async () => {
    const nextFav = await toggleFavorite(word.id);
    setIsFav(nextFav);
  };

  const playAudio = (textToSpeak) => {
    Speech.speak(textToSpeak || word.word, { language: 'ja-JP', pitch: 1.0, rate: 0.85 });
  };

  const toggleMastered = async () => {
    const isCurrentlyMastered = calculateMastery(masteryStats) === 'mastered';
    await recordMasteryRecords('kotoba', [
      { id: word.id, isCorrect: !isCurrentlyMastered },
      { id: word.id, isCorrect: !isCurrentlyMastered },
      { id: word.id, isCorrect: !isCurrentlyMastered },
    ]);
    loadWordData(word.id);
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentId(ALL_KOTOBA[currentIndex - 1].id);
    }
  };

  const goToNext = () => {
    if (currentIndex < ALL_KOTOBA.length - 1) {
      setCurrentId(ALL_KOTOBA[currentIndex + 1].id);
    }
  };

  const currentMastery = calculateMastery(masteryStats);
  const config = MASTERY_CONFIG[currentMastery];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backButton}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Kosakata</Text>
        <TouchableOpacity onPress={handleToggleFav} hitSlop={12}>
          <Text style={{ fontSize: 22 }}>{isFav ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Main Kanji Card */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <View style={styles.levelTag}>
              <Text style={styles.levelTagText}>{word.level}</Text>
            </View>
            <View style={[styles.masteryPill, { backgroundColor: config.bg }]}>
              <Text style={[styles.masteryPillText, { color: config.color }]}>
                {config.badge} {config.label}
              </Text>
            </View>
          </View>

          <Text style={styles.kanjiBig}>{word.word}</Text>
          <Text style={styles.readingText}>{word.reading}</Text>
          <Text style={styles.romajiText}>{word.romaji}</Text>

          <TouchableOpacity
            style={styles.audioBtn}
            onPress={() => playAudio(word.word)}
            activeOpacity={0.8}
          >
            <Text style={styles.audioIcon}>🔊</Text>
            <Text style={styles.audioText}>Dengarkan Pengucapan</Text>
          </TouchableOpacity>
        </View>

        {/* Meaning & Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Arti Bahasa Indonesia</Text>
          <Text style={styles.meaningText}>{word.meaning_id}</Text>
          <View style={styles.posBadge}>
            <Text style={styles.posText}>Jenis Kata: {word.part_of_speech}</Text>
          </View>
        </View>

        {/* Example Sentence */}
        <View style={styles.sectionCard}>
          <View style={styles.exampleHeader}>
            <Text style={styles.sectionLabel}>Contoh Kalimat</Text>
            <TouchableOpacity onPress={() => playAudio(word.example_jp)} hitSlop={8}>
              <Text style={{ fontSize: 16 }}>🔊</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.exampleJp}>{word.example_jp}</Text>
          <Text style={styles.exampleRomaji}>{word.example_romaji}</Text>
          <Text style={styles.exampleId}>"{word.example_id}"</Text>
        </View>

        {/* Action Toggle Mastery */}
        <TouchableOpacity
          style={[styles.masteryToggleBtn, currentMastery === 'mastered' ? styles.masteryActiveBtn : null]}
          onPress={toggleMastered}
          activeOpacity={0.85}
        >
          <Text style={[styles.masteryToggleText, currentMastery === 'mastered' ? styles.masteryActiveText : null]}>
            {currentMastery === 'mastered' ? '✓ Ditandai Sudah Mahir' : 'Tandai Sebagai Mahir 🟢'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footerNav}>
        <TouchableOpacity
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          onPress={goToPrev}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navBtnText}>← Sebelumnya</Text>
        </TouchableOpacity>
        <Text style={styles.counterText}>{currentIndex + 1} / {ALL_KOTOBA.length}</Text>
        <TouchableOpacity
          style={[styles.navBtn, currentIndex === ALL_KOTOBA.length - 1 && styles.navBtnDisabled]}
          onPress={goToNext}
          disabled={currentIndex === ALL_KOTOBA.length - 1}
        >
          <Text style={styles.navBtnText}>Berikutnya →</Text>
        </TouchableOpacity>
      </View>
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
  backButton: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  body: { padding: 20, paddingBottom: 30 },

  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelTagText: { fontSize: 13, fontWeight: '700', color: '#334155' },
  masteryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  masteryPillText: { fontSize: 12, fontWeight: '700' },

  kanjiBig: {
    fontSize: 64,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    includeFontPadding: false,
  },
  readingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 2,
  },
  romajiText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 18,
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  audioIcon: { fontSize: 16 },
  audioText: { color: '#2563eb', fontWeight: '700', fontSize: 14 },

  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#94a3b8', marginBottom: 6 },
  meaningText: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 8 },
  posBadge: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  posText: { fontSize: 12, color: '#64748b', fontWeight: '600' },

  exampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exampleJp: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  exampleRomaji: { fontSize: 14, color: '#64748b', marginBottom: 4 },
  exampleId: { fontSize: 14, color: '#334155', fontStyle: 'italic' },

  masteryToggleBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  masteryActiveBtn: { backgroundColor: '#dcfce7', borderColor: '#16a34a' },
  masteryToggleText: { color: '#16a34a', fontWeight: '700', fontSize: 15 },
  masteryActiveText: { color: '#15803d' },

  footerNav: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  navBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 13, fontWeight: '700', color: '#334155' },
  counterText: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },
});
