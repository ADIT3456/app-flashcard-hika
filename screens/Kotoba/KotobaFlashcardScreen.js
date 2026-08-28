import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { ALL_KOTOBA, filterKotoba } from '../../data/kotoba';
import {
  getNamespaceData,
  getFavoritesList,
  recordMasteryRecords,
  calculateMastery,
  MASTERY_CONFIG,
} from '../../utils/mastery';
import { getDueItems, calculateNextReviewDate } from '../../utils/srsLite';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function KotobaFlashcardScreen({ route, navigation }) {
  const category = route?.params?.category || 'all';
  const level = route?.params?.level || 'all';
  const mode = route?.params?.mode || 'all'; // 'all' | 'random' | 'favorites' | 'unlearned' | 'srs'

  const [masteryData, setMasteryData] = useState({});
  const [favoritesMap, setFavoritesMap] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionResults, setSessionResults] = useState({ correct: 0, wrong: 0 });

  // Animation values
  const frontOpacity = useRef(new Animated.Value(1)).current;
  const backOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function loadData() {
      const mData = await getNamespaceData('kotoba');
      const fData = await getFavoritesList();
      setMasteryData(mData || {});
      setFavoritesMap(fData || {});
      setIsLoaded(true);
    }
    loadData();
  }, []);

  const cards = useMemo(() => {
    if (!isLoaded) return [];
    let list = filterKotoba({ category, level, favoritesMap });

    if (mode === 'favorites') {
      list = list.filter((item) => !!favoritesMap[item.id]);
    } else if (mode === 'unlearned') {
      list = list.filter((item) => calculateMastery(masteryData[item.id]) === 'unlearned');
    } else if (mode === 'srs') {
      const due = getDueItems(list, masteryData);
      list = due.length > 0 ? due : list.slice(0, 20);
    }

    if (list.length === 0) list = ALL_KOTOBA.slice(0, 20);

    return mode === 'random' ? shuffle(list) : list;
  }, [category, level, mode, isLoaded, favoritesMap, masteryData]);

  const currentWord = cards[currentIndex] || ALL_KOTOBA[0];

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

  const handleAnswer = async (isCorrect) => {
    const prevStats = masteryData[currentWord.id] || { streak: 0 };
    const streak = isCorrect ? (prevStats.streak || 0) + 1 : 0;
    const nextReview = calculateNextReviewDate(streak, isCorrect);

    await recordMasteryRecords('kotoba', [{ id: currentWord.id, isCorrect }]);

    setSessionResults((prev) => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      wrong: !isCorrect ? prev.wrong + 1 : prev.wrong,
    }));

    if (currentIndex >= cards.length - 1) {
      setDone(true);
    } else {
      frontOpacity.setValue(1);
      backOpacity.setValue(0);
      setFlipped(false);
      setCurrentIndex((i) => i + 1);
    }
  };

  const playAudio = (textToSpeak) => {
    Speech.speak(textToSpeak || currentWord.word, { language: 'ja-JP', pitch: 1.0, rate: 0.85 });
  };

  const currentMastery = calculateMastery(masteryData[currentWord?.id]);
  const config = MASTERY_CONFIG[currentMastery] || MASTERY_CONFIG.unlearned;
  const progress = cards.length > 0 ? (currentIndex + 1) / cards.length : 0;

  if (done) {
    const total = sessionResults.correct + sessionResults.wrong;
    const percent = total > 0 ? Math.round((sessionResults.correct / total) * 100) : 0;
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>{percent >= 80 ? '🎉' : '💪'}</Text>
          <Text style={styles.doneTitle}>Sesi Flashcard Selesai!</Text>
          <Text style={styles.doneSubtitle}>Kamu telah mempelajari {cards.length} kosakata.</Text>

          <View style={styles.doneStatsRow}>
            <View style={styles.doneStatBox}>
              <Text style={[styles.doneStatNum, { color: '#16a34a' }]}>{sessionResults.correct}</Text>
              <Text style={styles.doneStatLabel}>Hafal ✅</Text>
            </View>
            <View style={styles.doneStatBox}>
              <Text style={[styles.doneStatNum, { color: '#ef4444' }]}>{sessionResults.wrong}</Text>
              <Text style={styles.doneStatLabel}>Lupa ❌</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={() => {
              setCurrentIndex(0);
              setDone(false);
              setSessionResults({ correct: 0, wrong: 0 });
            }}
          >
            <Text style={styles.actionBtnText}>Ulangi Sesi 🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.actionBtnSecondaryText}>Kembali ke Daftar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>← Keluar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flashcard Kotoba</Text>
        <Text style={styles.progressText}>{currentIndex + 1} / {cards.length}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      {/* Card */}
      <Pressable style={styles.cardWrapper} onPress={flip}>
        {/* Front: Kanji/Word */}
        <Animated.View style={[styles.card, { opacity: frontOpacity }]}>
          <View style={styles.cardTopRow}>
            <View style={styles.levelTag}>
              <Text style={styles.levelTagText}>{currentWord.level}</Text>
            </View>
            <View style={[styles.masteryBadge, { backgroundColor: config.bg }]}>
              <Text style={[styles.masteryBadgeText, { color: config.color }]}>
                {config.badge} {config.label}
              </Text>
            </View>
          </View>

          <Text style={styles.bigKanji}>{currentWord.word}</Text>
          <Text style={styles.posLabel}>({currentWord.part_of_speech})</Text>

          <TouchableOpacity
            style={styles.audioPill}
            onPress={() => playAudio(currentWord.word)}
            activeOpacity={0.8}
          >
            <Text style={styles.audioPillIcon}>🔊</Text>
            <Text style={styles.audioPillText}>Dengar Audio</Text>
          </TouchableOpacity>

          <Text style={styles.tapHint}>Ketuk kartu untuk melihat arti & contoh</Text>
        </Animated.View>

        {/* Back: Reading, Meaning, Example */}
        <Animated.View style={[styles.card, styles.cardBack, { opacity: backOpacity }]}>
          <View style={styles.cardTopRow}>
            <View style={styles.levelTag}>
              <Text style={styles.levelTagText}>{currentWord.level}</Text>
            </View>
            <View style={[styles.masteryBadge, { backgroundColor: config.bg }]}>
              <Text style={[styles.masteryBadgeText, { color: config.color }]}>
                {config.badge} {config.label}
              </Text>
            </View>
          </View>

          <Text style={styles.backReading}>{currentWord.reading}</Text>
          <Text style={styles.backRomaji}>{currentWord.romaji}</Text>
          <Text style={styles.backMeaning}>{currentWord.meaning_id}</Text>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleJp}>{currentWord.example_jp}</Text>
            <Text style={styles.exampleId}>"{currentWord.example_id}"</Text>
          </View>

          <Text style={styles.tapHint}>Ketuk untuk kembali</Text>
        </Animated.View>
      </Pressable>

      {/* Answer Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={styles.wrongBtn}
          onPress={() => handleAnswer(false)}
          activeOpacity={0.85}
        >
          <Text style={styles.wrongBtnText}>Belum Hafal ✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.correctBtn}
          onPress={() => handleAnswer(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.correctBtnText}>Sudah Hafal ✓</Text>
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
    borderBottomColor: '#e2e8f0',
  },
  backText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  progressText: { fontSize: 14, color: '#64748b', fontWeight: '600' },

  progressBarBg: { height: 5, backgroundColor: '#e2e8f0' },
  progressBarFill: { height: 5, backgroundColor: '#2563eb', borderRadius: 3 },

  cardWrapper: {
    flex: 1,
    margin: 20,
    marginTop: 16,
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
  cardTopRow: {
    position: 'absolute',
    top: 18,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelTagText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  masteryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  masteryBadgeText: { fontSize: 12, fontWeight: '700' },

  bigKanji: {
    fontSize: 54,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    textAlign: 'center',
    includeFontPadding: false,
  },
  posLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginBottom: 20 },

  audioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 20,
  },
  audioPillIcon: { fontSize: 16 },
  audioPillText: { color: '#2563eb', fontWeight: '700', fontSize: 13 },

  backReading: { fontSize: 26, fontWeight: '800', color: '#2563eb', marginBottom: 2 },
  backRomaji: { fontSize: 15, color: '#64748b', fontWeight: '500', marginBottom: 12 },
  backMeaning: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 20, textAlign: 'center' },

  exampleBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
    marginBottom: 10,
  },
  exampleJp: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  exampleId: { fontSize: 13, color: '#64748b', fontStyle: 'italic' },

  tapHint: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },

  controlsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  wrongBtn: {
    flex: 1,
    backgroundColor: '#fee2e2',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  wrongBtnText: { color: '#b91c1c', fontWeight: '700', fontSize: 15 },
  correctBtn: {
    flex: 1,
    backgroundColor: '#dcfce7',
    borderWidth: 1.5,
    borderColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  correctBtnText: { color: '#15803d', fontWeight: '700', fontSize: 15 },

  doneContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  doneEmoji: { fontSize: 72, marginBottom: 16 },
  doneTitle: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  doneSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 28 },
  doneStatsRow: { flexDirection: 'row', gap: 20, marginBottom: 36 },
  doneStatBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  doneStatNum: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  doneStatLabel: { fontSize: 13, fontWeight: '600', color: '#64748b' },

  actionBtnPrimary: {
    width: '100%',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  actionBtnSecondary: { paddingVertical: 12 },
  actionBtnSecondaryText: { color: '#64748b', fontWeight: '600', fontSize: 15 },
});
