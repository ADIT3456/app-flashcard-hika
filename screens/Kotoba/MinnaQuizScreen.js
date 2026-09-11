// screens/Kotoba/MinnaQuizScreen.js
// Tes kosakata Minna no Nihongo (Per Bab & Komprehensif Bab 1-50) — Pilihan Ganda

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { getVocabItems, getVocabItemsByScope, updateBatchProgress, recordStudySession } from '../../db';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MinnaQuizScreen({ route, navigation }) {
  const unitId = route?.params?.unitId;
  const scope = route?.params?.scope || (unitId ? 'chapter' : 'all_50'); // 'chapter' | 'all_50' | 'n5' | 'n4'
  const paramBab = route?.params?.bab;
  const paramTitle = route?.params?.title;

  const [allItems, setAllItems] = useState([]);
  const [distractorPool, setDistractorPool] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [results, setResults] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const sessionStart = useRef(new Date().toISOString());

  const getTestHeaders = () => {
    if (scope === 'chapter' && paramBab) {
      return { babName: paramBab, testTitle: paramTitle || 'Tes Kosakata Bab' };
    }
    if (scope === 'n5') {
      return { babName: 'Level N5', testTitle: 'Tes Kosakata Bab 1–25' };
    }
    if (scope === 'n4') {
      return { babName: 'Level N4', testTitle: 'Tes Kosakata Bab 26–50' };
    }
    return { babName: 'Bab 1–50', testTitle: 'Tes Hafalan Komprehensif 50 Bab' };
  };

  const { babName, testTitle } = getTestHeaders();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        let items = [];
        // Muat juga distractor cadangan dari seluruh database agar selalu ada 4 opsi berbeda
        const allGlobal = await getVocabItems(null, 'random');
        if (scope === 'chapter' && unitId) {
          items = await getVocabItems(unitId, 'random');
        } else if (scope === 'n5') {
          items = await getVocabItemsByScope('n5', 20);
        } else if (scope === 'n4') {
          items = await getVocabItemsByScope('n4', 20);
        } else {
          // Bab 1-50 full test
          items = await getVocabItemsByScope('all_50', 25);
        }

        if (!active) return;
        setAllItems(items);
        setDistractorPool(allGlobal);
        setQueue(shuffle(items));
        setLoading(false);
      } catch (e) {
        console.warn('Error loading quiz items:', e);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [unitId, scope]);

  const currentItem = queue[currentIndex];

  const currentOptions = useMemo(() => {
    if (!currentItem) return [];
    const correct = currentItem.meaning;
    // Ambil opsi pengecoh dari allItems, dan fallback ke distractorPool jika kurang dari 4
    const available = [...allItems, ...distractorPool];
    const others = [...new Set(
      available.filter((x) => x.meaning && x.meaning !== correct).map((x) => x.meaning)
    )];
    const distractors = shuffle(others).slice(0, 3);
    return shuffle([correct, ...distractors]);
  }, [currentItem, allItems, distractorPool]);

  const playAudio = (text) => {
    if (!text) return;
    Speech.stop();
    Speech.speak(text, { language: 'ja-JP', pitch: 1.0, rate: 0.85 });
  };

  const handleSelect = (option) => {
    if (isAnswered || !currentItem) return;
    const isCorrect = option === currentItem.meaning;
    setSelectedOption(option);
    setIsAnswered(true);

    // Audio native berbunyi saat memilih
    playAudio(currentItem.char);

    const newResult = {
      itemId: currentItem.key,
      word: currentItem.char,
      reading: currentItem.romaji,
      meaning: currentItem.meaning,
      chapter: currentItem.level_or_bab || paramBab,
      chosen: option,
      isCorrect,
    };
    const newResults = [...results, newResult];
    setResults(newResults);

    setTimeout(() => {
      // Jika salah, masukkan lagi ke antrean belakang agar dilatih sampai hafal
      const newQueue = isCorrect ? queue : [...queue, currentItem];
      if (!isCorrect) setQueue(newQueue);

      const nextIdx = currentIndex + 1;
      const qLen = isCorrect ? queue.length : newQueue.length;
      if (nextIdx < qLen) {
        setCurrentIndex(nextIdx);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        finishSession(newResults);
      }
    }, 1100);
  };

  const finishSession = async (finalResults) => {
    setIsFinished(true);
    if (finalResults.length > 0) {
      await updateBatchProgress('vocab', finalResults.map((r) => ({ itemId: r.itemId, isCorrect: r.isCorrect })));
      await recordStudySession({
        mode: quiz_,
        module: 'vocab',
        score: finalResults.filter((r) => r.isCorrect).length,
        total: finalResults.length,
        startedAt: sessionStart.current,
        finishedAt: new Date().toISOString(),
      });
    }
  };

  if (loading || (!currentItem && !isFinished)) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={s.loadTxt}>Menyiapkan soal tes kosakata...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isFinished) {
    const total = results.length;
    const correctCount = results.filter((r) => r.isCorrect).length;
    const acc = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const wrongItems = [...new Map(results.filter((r) => !r.isCorrect).map((r) => [r.itemId, r])).values()];

    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={s.exitTxt}>✕ Keluar</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Hasil Tes</Text>
          <View style={{ minWidth: 56 }} />
        </View>

        <ScrollView contentContainerStyle={s.resultWrap}>
          <Text style={s.resultEmoji}>{acc >= 80 ? '🎉' : acc >= 60 ? '👍' : '💪'}</Text>
          <Text style={s.resultTitle}>Tes Selesai!</Text>
          <Text style={s.resultSub}>{babName} • {testTitle}</Text>

          <View style={s.scoreRow}>
            <Text style={s.scoreBig}>{correctCount}</Text>
            <Text style={s.scoreUnit}>/ {allItems.length} Benar ({acc}%)</Text>
          </View>

          <View style={s.pills}>
            {[
              ['Akurasi', `${acc}%`],
              ['Benar', correctCount],
              ['Perlu Ulang', wrongItems.length],
            ].map(([l, v]) => (
              <View key={l} style={s.pill}>
                <Text style={[s.pillV, l === 'Perlu Ulang' && wrongItems.length > 0 ? { color: '#ef4444' } : {}]}>{v}</Text>
                <Text style={s.pillL}>{l}</Text>
              </View>
            ))}
          </View>

          {wrongItems.length > 0 && (
            <View style={s.reviewBox}>
              <Text style={s.reviewTitle}>Kosakata yang perlu diulang:</Text>
              {wrongItems.map((w) => (
                <TouchableOpacity
                  key={w.itemId}
                  style={s.reviewRow}
                  onPress={() => playAudio(w.word)}
                  activeOpacity={0.7}
                >
                  <View style={s.reviewLeft}>
                    <Text style={s.reviewWord}>{w.word}</Text>
                    <Text style={s.reviewReading}>
                      {w.reading} {w.chapter ? `• ${w.chapter}` : ''}
                    </Text>
                  </View>
                  <Text style={s.reviewMeaning}>{w.meaning}</Text>
                  <Text style={s.reviewAudio}>🔊</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={s.primaryBtn}
            activeOpacity={0.85}
            onPress={() => {
              setCurrentIndex(0);
              setResults([]);
              setSelectedOption(null);
              setIsAnswered(false);
              setIsFinished(false);
              setQueue(shuffle(allItems));
              sessionStart.current = new Date().toISOString();
            }}
          >
            <Text style={s.primaryBtnTxt}>Tes Ulang 🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secBtn} onPress={() => navigation.goBack()}>
            <Text style={s.secBtnTxt}>Kembali</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const progPct = queue.length > 0 ? Math.min((currentIndex / queue.length) * 100, 100) : 0;
  const originalCount = allItems.length;
  const isRepeat = currentIndex >= originalCount;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={s.exitTxt}>✕ Keluar</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{babName}</Text>
        <Text style={s.counter}>{Math.min(currentIndex + 1, originalCount)}/{originalCount}</Text>
      </View>

      <View style={s.progBg}><View style={[s.progFill, { width: `${progPct}%` }]} /></View>

      <View style={s.body}>
        <View style={s.card}>
          {isRepeat && (
            <View style={s.repeatTag}>
              <Text style={s.repeatTagTxt}>🔁 Ulangi</Text>
            </View>
          )}

          {currentItem?.level_or_bab && (
            <View style={s.chapterBadge}>
              <Text style={s.chapterBadgeText}>{currentItem.level_or_bab}</Text>
            </View>
          )}

          <TouchableOpacity onPress={() => playAudio(currentItem?.char)} activeOpacity={0.7} style={s.wordWrap}>
            <Text style={s.wordTxt}>{currentItem?.char}</Text>
            {currentItem?.romaji ? <Text style={s.readingTxt}>{currentItem.romaji}</Text> : null}
            <Text style={s.audioHint}>🔊 ketuk untuk dengar audio</Text>
          </TouchableOpacity>

          <Text style={s.questionLabel}>Pilih arti bahasa Indonesia yang benar:</Text>
        </View>

        <View style={s.opts}>
          {currentOptions.map((opt, idx) => {
            const isSel = selectedOption === opt;
            const isCorrectOpt = opt === currentItem?.meaning;
            return (
              <TouchableOpacity
                key={idx}
                style={[s.optBtn, isAnswered && (isCorrectOpt ? s.optOk : isSel ? s.optBad : null)]}
                onPress={() => handleSelect(opt)}
                disabled={isAnswered}
                activeOpacity={0.8}
              >
                <Text style={[s.optTxt, isAnswered && (isCorrectOpt ? s.optTxtOk : isSel ? s.optTxtBad : null)]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fafafa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadTxt: { marginTop: 12, fontSize: 14, color: '#64748b' },
  header: {
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  exitTxt: { fontSize: 13, color: '#94a3b8', fontWeight: '600', minWidth: 56 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', flex: 1, textAlign: 'center' },
  counter: { fontSize: 13, color: '#64748b', fontWeight: '700', minWidth: 56, textAlign: 'right' },
  progBg: { height: 4, backgroundColor: '#e2e8f0' },
  progFill: { height: 4, backgroundColor: '#6366f1', borderRadius: 2 },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, justifyContent: 'space-between' },
  card: {
    backgroundColor: '#fff', borderRadius: 20, paddingVertical: 24, paddingHorizontal: 20,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#e2e8f0', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8,
    position: 'relative',
  },
  repeatTag: {
    position: 'absolute', top: 10, right: 12,
    backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  repeatTagTxt: { fontSize: 10, fontWeight: '800', color: '#b45309' },
  chapterBadge: {
    position: 'absolute', top: 10, left: 12,
    backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  chapterBadgeText: { fontSize: 10, fontWeight: '700', color: '#475569' },
  wordWrap: { alignItems: 'center', marginVertical: 8 },
  wordTxt: { fontSize: 40, fontWeight: '800', color: '#0f172a', includeFontPadding: false, textAlign: 'center' },
  readingTxt: { fontSize: 16, color: '#6366f1', fontWeight: '600', marginTop: 4, textAlign: 'center' },
  audioHint: { fontSize: 11, color: '#94a3b8', marginTop: 6 },
  questionLabel: { fontSize: 12, color: '#64748b', fontWeight: '600', marginTop: 4 },
  opts: { gap: 10, marginBottom: 4 },
  optBtn: {
    backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#e2e8f0', elevation: 1,
  },
  optOk: { backgroundColor: '#dcfce7', borderColor: '#16a34a' },
  optBad: { backgroundColor: '#fee2e2', borderColor: '#dc2626' },
  optTxt: { fontSize: 14, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  optTxtOk: { color: '#15803d' },
  optTxtBad: { color: '#b91c1c' },
  resultWrap: { flexGrow: 1, padding: 20, alignItems: 'center' },
  resultEmoji: { fontSize: 56, marginBottom: 8, marginTop: 8 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  resultSub: { fontSize: 13, color: '#64748b', marginBottom: 16, textAlign: 'center' },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 16 },
  scoreBig: { fontSize: 40, fontWeight: '900', color: '#6366f1' },
  scoreUnit: { fontSize: 16, fontWeight: '700', color: '#334155' },
  pills: { flexDirection: 'row', gap: 10, marginBottom: 16, width: '100%' },
  pill: { flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  pillV: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  pillL: { fontSize: 10, color: '#64748b', fontWeight: '600' },
  reviewBox: { width: '100%', marginBottom: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  reviewTitle: { fontSize: 12, fontWeight: '700', color: '#64748b', padding: 12, backgroundColor: '#f8fafc' },
  reviewRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 8,
  },
  reviewLeft: { flex: 1 },
  reviewWord: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  reviewReading: { fontSize: 12, color: '#6366f1', fontWeight: '600' },
  reviewMeaning: { fontSize: 13, color: '#334155', fontWeight: '600', flex: 1, textAlign: 'right' },
  reviewAudio: { fontSize: 18, marginLeft: 4 },
  primaryBtn: {
    backgroundColor: '#6366f1', width: '100%', paddingVertical: 15,
    borderRadius: 14, alignItems: 'center', marginBottom: 10, marginTop: 8,
  },
  primaryBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secBtn: { width: '100%', paddingVertical: 12, alignItems: 'center' },
  secBtnTxt: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
});
