import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import hiraganaData from '../data/hiragana';
import katakanaData from '../data/katakana';
import { loadProgress, getMasteryLevel, recordMasteryRecords, MASTERY_CONFIG } from '../utils/mastery';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardScreen({ route, navigation }) {
  const type = route?.params?.type || 'hiragana';
  const mode = route?.params?.mode || 'sequential';

  const allCards = type === 'hiragana' ? hiraganaData : katakanaData;
  const cards = useMemo(
    () => (mode === 'random' ? shuffle(allCards) : allCards),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [progressMap, setProgressMap] = useState({});

  useEffect(() => {
    loadProgress().then(setProgressMap);
  }, []);

  // Flip animation via opacity crossfade
  const frontOpacity = useRef(new Animated.Value(1)).current;
  const backOpacity = useRef(new Animated.Value(0)).current;

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

  const finishSession = async () => {
    await recordMasteryRecords('kana', cards.map((c) => ({ id: c.key, isCorrect: true })));
    setDone(true);
  };

  const next = () => {
    if (index >= cards.length - 1) {
      finishSession();
      return;
    }
    frontOpacity.setValue(1);
    backOpacity.setValue(0);
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  const prev = () => {
    if (index > 0) {
      frontOpacity.setValue(1);
      backOpacity.setValue(0);
      setFlipped(false);
      setIndex((i) => i - 1);
    }
  };

  const speak = () => {
    Speech.speak(cards[index].char, { language: 'ja-JP', pitch: 1.0, rate: 0.9 });
  };

  const goHome = () => navigation.navigate('HomeMain');

  const progress = (index + 1) / cards.length;
  const card = cards[index];
  const level = getMasteryLevel(progressMap[card?.key]);
  const masteryInfo = MASTERY_CONFIG[level] || MASTERY_CONFIG.unlearned;

  const sessionTitle = type === 'hiragana' ? 'Hiragana Session' : 'Katakana Session';

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>Sesi Selesai!</Text>
          <Text style={styles.doneSubtitle}>{cards.length} kartu selesai dipelajari.</Text>
          <TouchableOpacity style={styles.nextBtn} onPress={goHome}>
            <Text style={styles.nextText}>Kembali ke Home</Text>
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
          <Text style={styles.backButton}>← Keluar</Text>
        </TouchableOpacity>
        <Text style={styles.sessionTitle}>{sessionTitle}</Text>
        <Text style={styles.progressText}>{index + 1} / {cards.length}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      {/* Flashcard with Native Typography */}
      <Pressable style={styles.cardWrapper} onPress={flip}>
        {/* Front: Big Japanese Character */}
        <Animated.View style={[styles.card, { opacity: frontOpacity }]}>
          <View style={[styles.masteryBadge, { backgroundColor: masteryInfo.bg }]}>
            <Text style={[styles.masteryBadgeText, { color: masteryInfo.color }]}>
              {masteryInfo.badge} {masteryInfo.label}
            </Text>
          </View>
          <Text style={styles.japaneseChar}>{card.char}</Text>
          <Text style={styles.flipHint}>Ketuk untuk melihat Romaji</Text>
        </Animated.View>

        {/* Back: Romaji & Detail */}
        <Animated.View style={[styles.card, styles.cardBack, { opacity: backOpacity }]}>
          <View style={[styles.masteryBadge, { backgroundColor: masteryInfo.bg }]}>
            <Text style={[styles.masteryBadgeText, { color: masteryInfo.color }]}>
              {masteryInfo.badge} {masteryInfo.label}
            </Text>
          </View>
          <Text style={styles.romajiText}>{card.romaji}</Text>
          <Text style={styles.charSubtitle}>{card.char}</Text>
          <Text style={styles.flipHint}>Ketuk untuk kembali</Text>
        </Animated.View>
      </Pressable>

      {/* Action Controls */}
      <View style={styles.btnRow}>
        {index > 0 && (
          <TouchableOpacity style={styles.prevBtn} onPress={prev}>
            <Text style={styles.prevText}>←</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.speakBtn} onPress={speak} activeOpacity={0.8}>
          <Text style={styles.speakIcon}>🔊</Text>
          <Text style={styles.speakLabel}>Putar Audio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextBtn} onPress={next} activeOpacity={0.8}>
          <Text style={styles.nextText}>{index === cards.length - 1 ? 'Selesai' : 'Lanjut →'}</Text>
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
  backButton: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  sessionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  progressText: { fontSize: 14, color: '#64748b', fontWeight: '600' },

  progressBarBg: { height: 5, backgroundColor: '#e2e8f0' },
  progressBarFill: { height: 5, backgroundColor: '#2563eb', borderRadius: 3 },

  cardWrapper: {
    flex: 1,
    margin: 20,
    marginTop: 20,
  },
  card: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    borderRadius: 28,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  masteryBadgeText: { fontSize: 12, fontWeight: '700' },

  japaneseChar: {
    fontSize: 120,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    includeFontPadding: false,
  },
  romajiText: {
    fontSize: 64,
    fontWeight: '800',
    color: '#2563eb',
    textAlign: 'center',
  },
  charSubtitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 8,
  },
  flipHint: {
    position: 'absolute',
    bottom: 24,
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },

  btnRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
    alignItems: 'center',
  },
  prevBtn: {
    width: 50,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevText: { fontSize: 18, fontWeight: '700', color: '#475569' },
  speakBtn: {
    flex: 1,
    height: 52,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
  },
  speakIcon: { fontSize: 18 },
  speakLabel: { color: '#2563eb', fontWeight: '700', fontSize: 15 },

  nextBtn: {
    flex: 1.2,
    height: 52,
    backgroundColor: '#2563eb',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  doneContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  doneEmoji: { fontSize: 72, marginBottom: 16 },
  doneTitle: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  doneSubtitle: { fontSize: 16, color: '#64748b', marginBottom: 36, textAlign: 'center' },
});
