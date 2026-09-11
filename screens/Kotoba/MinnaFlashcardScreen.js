// screens/Kotoba/MinnaFlashcardScreen.js
// Latihan Flashcard Kosakata Minna no Nihongo dengan Sinkronisasi SQLite Lokal

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { getVocabItems, getProgressMap, updateBatchProgress, recordStudySession } from '../../db';
import { MASTERY_CONFIG } from '../../utils/mastery';

export default function MinnaFlashcardScreen({ route, navigation }) {
  const unitId = route?.params?.unitId;
  const bab = route?.params?.bab || 'Bab';
  const title = route?.params?.title || 'Flashcard Kosakata';
  const mode = route?.params?.mode || 'sequential';

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const [sessionResults, setSessionResults] = useState([]); // [{ id, isCorrect }]
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const sessionStartTime = useRef(new Date().toISOString());

  // Animation crossfade
  const frontOpacity = useRef(new Animated.Value(1)).current;
  const backOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [items, pMap] = await Promise.all([
          getVocabItems(unitId, mode),
          getProgressMap('vocab'),
        ]);
        if (active) {
          setCards(items);
          setProgressMap(pMap || {});
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error loading flashcard items:', err);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [unitId, mode]);

  const flip = () => {
    if (flipped) {
      Animated.parallel([
        Animated.timing(frontOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(backOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(() => setFlipped(false));
    } else {
      Animated.parallel([
        Animated.timing(frontOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(backOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start(() => setFlipped(true));
    }
  };

  const playAudio = (text) => {
    Speech.stop();
    Speech.speak(text, { language: 'ja-JP', pitch: 1.0, rate: 0.85 });
  };

  const handleVote = async (isCorrect) => {
    const current = cards[currentIndex];
    const newResults = [
      ...sessionResults,
      { itemId: current.key, isCorrect },
    ];
    setSessionResults(newResults);

    if (currentIndex >= cards.length - 1) {
      // Selesaikan sesi
      await updateBatchProgress('vocab', newResults);
      await recordStudySession({
        mode: `flashcard_${mode}`,
        module: 'vocab',
        score: newResults.filter((r) => r.isCorrect).length,
        total: cards.length,
        startedAt: sessionStartTime.current,
        finishedAt: new Date().toISOString(),
      });
      setIsFinished(true);
    } else {
      frontOpacity.setValue(1);
      backOpacity.setValue(0);
      setFlipped(false);
      setCurrentIndex((i) => i + 1);
    }
  };

  if (loading || !cards || cards.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ marginTop: 12, color: '#64748b' }}>Memuat kartu belajar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Selesai Sesi
  if (isFinished) {
    const correctCount = sessionResults.filter((r) => r.isCorrect).length;
    const totalCount = cards.length;
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>{accuracy >= 80 ? '🎉' : '👍'}</Text>
          <Text style={styles.resultTitle}>Sesi {bab} Selesai!</Text>
          <Text style={styles.resultSubtitle}>{title}</Text>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreNumber}>{correctCount} / {totalCount}</Text>
            <Text style={styles.scoreAccuracy}>Tingkat Penguasaan: {accuracy}%</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              setCurrentIndex(0);
              setFlipped(false);
              setSessionResults([]);
              setIsFinished(false);
              frontOpacity.setValue(1);
              backOpacity.setValue(0);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Pelajari Lagi 🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Kembali ke Bab</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const current = cards[currentIndex];
  const progressPercent = ((currentIndex + 1) / cards.length) * 100;
  const p = progressMap[current.key];
  const status = p?.status || 'new';
  const mConfig = MASTERY_CONFIG[status === 'new' ? 'unlearned' : status];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backBtn}>✕ Keluar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{bab}: {title}</Text>
        <Text style={styles.counterText}>{currentIndex + 1} / {cards.length}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Flashcard Body */}
      <Pressable style={styles.cardContainer} onPress={flip}>
        {/* Front of Card */}
        <Animated.View style={[styles.card, { opacity: frontOpacity }]}>
          <View style={[styles.masteryBadge, { backgroundColor: mConfig.bg }]}>
            <Text style={[styles.masteryBadgeText, { color: mConfig.color }]}>
              {mConfig.badge} {mConfig.label}
            </Text>
          </View>

          <Text style={styles.frontWord}>{current.word}</Text>
          <Text style={styles.frontReading}>[{current.reading}]</Text>

          <TouchableOpacity
            style={styles.audioBtn}
            onPress={(e) => {
              e.stopPropagation();
              playAudio(current.word);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.audioBtnIcon}>🔊</Text>
            <Text style={styles.audioBtnLabel}>Dengarkan Audio</Text>
          </TouchableOpacity>

          <Text style={styles.flipHint}>Ketuk kartu untuk melihat arti & contoh kalimat</Text>
        </Animated.View>

        {/* Back of Card */}
        <Animated.View style={[styles.card, styles.cardBack, { opacity: backOpacity }]}>
          <View style={[styles.masteryBadge, { backgroundColor: mConfig.bg }]}>
            <Text style={[styles.masteryBadgeText, { color: mConfig.color }]}>
              {mConfig.badge} {mConfig.label}
            </Text>
          </View>

          <Text style={styles.backMeaning}>{current.meaning_id}</Text>
          <Text style={styles.backSubWord}>{current.word} ({current.reading})</Text>

          {current.example_sentence ? (
            <View style={styles.exampleBox}>
              <Text style={styles.exampleJapanese}>{current.example_sentence}</Text>
              <Text style={styles.exampleIndonesian}>{current.example_translation}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.audioBtnMini}
            onPress={(e) => {
              e.stopPropagation();
              playAudio(current.example_sentence || current.word);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.audioBtnLabel}>🔊 Putar Contoh</Text>
          </TouchableOpacity>

          <Text style={styles.flipHint}>Ketuk kartu untuk kembali</Text>
        </Animated.View>
      </Pressable>

      {/* Action Buttons: Belum Ingat vs Sudah Ingat */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.wrongBtn}
          onPress={() => handleVote(false)}
          activeOpacity={0.85}
        >
          <Text style={styles.btnIcon}>❌</Text>
          <Text style={styles.wrongBtnText}>Belum Ingat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.correctBtn}
          onPress={() => handleVote(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.btnIcon}>✅</Text>
          <Text style={styles.correctBtnText}>Sudah Paham</Text>
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
  backBtn: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', maxWidth: 200 },
  counterText: { fontSize: 14, color: '#64748b', fontWeight: '700' },

  progressBarBg: { height: 5, backgroundColor: '#e2e8f0' },
  progressBarFill: { height: 5, backgroundColor: '#2563eb', borderRadius: 3 },

  cardContainer: {
    flex: 1,
    margin: 20,
    marginTop: 16,
    position: 'relative',
  },
  card: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  cardBack: { backgroundColor: '#fff' },

  masteryBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  masteryBadgeText: { fontSize: 11, fontWeight: '700' },

  frontWord: {
    fontSize: 44,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 6,
    includeFontPadding: false,
  },
  frontReading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 24,
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  audioBtnIcon: { fontSize: 18 },
  audioBtnLabel: { fontSize: 14, fontWeight: '700', color: '#2563eb' },

  backMeaning: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 4,
  },
  backSubWord: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 20,
  },
  exampleBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  exampleJapanese: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    lineHeight: 22,
  },
  exampleIndonesian: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  audioBtnMini: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
  },

  flipHint: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },

  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
  wrongBtn: {
    flex: 1,
    backgroundColor: '#fee2e2',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
  },
  wrongBtnText: { color: '#dc2626', fontSize: 15, fontWeight: '800' },
  correctBtn: {
    flex: 1,
    backgroundColor: '#dcfce7',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#86efac',
  },
  correctBtnText: { color: '#16a34a', fontSize: 15, fontWeight: '800' },
  btnIcon: { fontSize: 16 },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  resultEmoji: { fontSize: 72, marginBottom: 12 },
  resultTitle: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  resultSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  scoreBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 28,
  },
  scoreNumber: { fontSize: 40, fontWeight: '900', color: '#2563eb', marginBottom: 4 },
  scoreAccuracy: { fontSize: 14, color: '#64748b', fontWeight: '600' },

  primaryBtn: {
    backgroundColor: '#2563eb',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { width: '100%', paddingVertical: 14, alignItems: 'center' },
  secondaryBtnText: { color: '#64748b', fontSize: 15, fontWeight: '600' },
});
