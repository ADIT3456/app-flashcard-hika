import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import hiraganaData from '../data/hiragana';
import katakanaData from '../data/katakana';

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
    // ponytail: memo only on mount; mode & type won't change mid-session
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  // Flip animation via opacity crossfade (no extra deps)
  const frontOpacity = useRef(new Animated.Value(1)).current;
  const backOpacity = useRef(new Animated.Value(0)).current;

  const flip = () => {
    if (flipped) {
      Animated.parallel([
        Animated.timing(frontOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(backOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setFlipped(false));
    } else {
      Animated.parallel([
        Animated.timing(frontOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(backOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start(() => setFlipped(true));
    }
  };

  const next = () => {
    if (index >= cards.length - 1) {
      setDone(true);
      return;
    }
    // Reset flip before moving
    frontOpacity.setValue(1);
    backOpacity.setValue(0);
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  const speak = () => {
    Speech.speak(cards[index].char, { language: 'ja-JP' });
  };

  const goHome = () => navigation.navigate('Home');

  const progress = (index + 1) / cards.length;
  const card = cards[index];
  const SvgComponent = card?.svg;

  const sessionTitle = type === 'hiragana' ? 'Hiragana Session' : 'Katakana Session';

  // ── Done screen ──
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
        <Text style={styles.sessionTitle}>{sessionTitle}</Text>
        <Text style={styles.progress}>{index + 1} / {cards.length}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      {/* Flashcard */}
      <Pressable style={styles.cardWrapper} onPress={flip}>
        {/* Front: SVG */}
        <Animated.View style={[styles.card, { opacity: frontOpacity }]}>
          {SvgComponent && <SvgComponent width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />}
        </Animated.View>

        {/* Back: romaji */}
        <Animated.View style={[styles.card, styles.cardBack, { opacity: backOpacity }]}>
          <Text style={styles.romajiText}>{card.romaji}</Text>
          <Text style={styles.charText}>{card.char}</Text>
        </Animated.View>
      </Pressable>

      <Text style={styles.hint}>Tap card to flip</Text>

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.speakBtn} onPress={speak}>
          <Text style={styles.speakIcon}>🔊</Text>
          <Text style={styles.speakLabel}>Putar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextBtn} onPress={next}>
          <Text style={styles.nextText}>Lanjut</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f7fb' },

  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  sessionTitle: { fontSize: 15, fontWeight: '600', color: '#1a73e8' },
  progress: { fontSize: 14, color: '#555', fontWeight: '500' },

  progressBarBg: { height: 6, backgroundColor: '#e0e0e0' },
  progressBarFill: { height: 6, backgroundColor: '#34a853', borderRadius: 3 },

  cardWrapper: {
    flex: 1,
    margin: 20,
    marginTop: 24,
  },
  card: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardBack: { backgroundColor: '#fff' },

  romajiText: { fontSize: 56, fontWeight: '700', color: '#1a73e8' },
  charText: { fontSize: 28, color: '#555', marginTop: 12 },

  hint: { textAlign: 'center', color: '#aaa', fontSize: 13, marginBottom: 20 },

  btnRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  speakBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#1a73e8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
  },
  speakIcon: { fontSize: 18 },
  speakLabel: { color: '#1a73e8', fontWeight: '600', fontSize: 15 },

  nextBtn: {
    flex: 2,
    backgroundColor: '#1a73e8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // Done screen
  doneContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  doneEmoji: { fontSize: 72, marginBottom: 16 },
  doneTitle: { fontSize: 28, fontWeight: '800', color: '#1a1a2e', marginBottom: 8 },
  doneSubtitle: { fontSize: 16, color: '#555', marginBottom: 40 },
});
