// screens/KanaPracticeScreen.js
// Mode: 'belajar' (unified visual+audio+spaced repeat) | 'timed_challenge' | 'weak_spot'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { getCharacters, getWeakKana, getProgressMap, updateBatchProgress, recordStudySession } from '../db';

const { height: SH } = Dimensions.get('window');
const CARD_H = Math.max(SH * 0.22, 140);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Urutan bertahap dari gampang ke susah:
// 1. Karakter dengan nilai penguasaan tinggi lebih dulu
// 2. Jika nilai sama, urutkan berdasarkan kurikulum dasar (vokal a, i, u, e, o -> k-row -> dst.)
function sortByProgressiveDifficulty(items, pMap) {
  return [...items].sort((a, b) => {
    const pa = pMap[a.key] || {};
    const pb = pMap[b.key] || {};
    const sa = (pa.correct || 0) - (pa.wrongCount || 0) * 2;
    const sb = (pb.correct || 0) - (pb.wrongCount || 0) * 2;
    if (sb !== sa) {
      return sb - sa; // nilai tinggi/gampang di awal, nilai rendah/sulit di akhir
    }
    return (a.sort_order || 0) - (b.sort_order || 0); // vokal & baris awal duluan
  });
}

export default function KanaPracticeScreen({ route, navigation }) {
  const mode = route?.params?.mode || 'belajar';
  const category = route?.params?.category || 'all';

  const [pool, setPool] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState(null); // 'perfect' | 'slow' | 'wrong'
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [results, setResults] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const timerRef = useRef(null);
  const sessionStart = useRef(new Date().toISOString());
  const questionStartTime = useRef(Date.now());

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const pMap = await getProgressMap('kana');
        let items = [];
        if (mode === 'weak_spot') {
          const weak = await getWeakKana(20);
          items = weak.length >= 4 ? weak : shuffle(await getCharacters(category)).slice(0, 15);
        } else {
          items = await getCharacters(category);
        }
        if (!active) return;
        setPool(items);
        let ordered;
        if (mode === 'timed_challenge') {
          ordered = shuffle(items).slice(0, 30);
        } else {
          // Bertahap dari gampang ke susah
          ordered = sortByProgressiveDifficulty(items, pMap).slice(0, 20);
        }
        setQueue(ordered);
        setLoading(false);
        questionStartTime.current = Date.now();
      } catch (e) {
        console.warn(e);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [mode, category]);

  useEffect(() => {
    if (mode === 'timed_challenge' && !loading && !isFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft((p) => {
          if (p <= 1) { clearInterval(timerRef.current); finishSession(true); return 0; }
          return p - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [mode, loading, isFinished]);

  const currentItem = queue[currentIndex];

  const playAudio = useCallback((char) => {
    if (!char) return;
    Speech.stop();
    Speech.speak(char, { language: 'ja-JP', pitch: 1.0, rate: 0.85 });
  }, []);

  const currentOptions = useMemo(() => {
    if (!currentItem || pool.length < 4) return [];
    const correct = currentItem.romaji;
    const others = [...new Set(pool.filter((c) => c.romaji !== correct).map((c) => c.romaji))];
    return shuffle([correct, ...shuffle(others).slice(0, 3)]);
  }, [currentItem, pool]);

  const handleSelect = (option) => {
    if (isAnswered || !currentItem) return;

    const duration = (Date.now() - questionStartTime.current) / 1000;
    const isCorrect = option === currentItem.romaji;
    const isSlow = duration > 3.5; // lebih dari 3.5 detik dianggap lambat
    const needsRepeat = mode === 'belajar' && (!isCorrect || isSlow);

    setSelectedOption(option);
    setIsAnswered(true);

    if (!isCorrect) {
      setAnswerFeedback('wrong');
    } else if (isSlow) {
      setAnswerFeedback('slow');
    } else {
      setAnswerFeedback('perfect');
    }

    // Putar audio langsung setelah user memilih jawaban
    playAudio(currentItem.char);

    const newCombo = isCorrect ? combo + 1 : 0;
    setCombo(newCombo);
    if (newCombo > maxCombo) setMaxCombo(newCombo);

    const pts = mode === 'timed_challenge' ? 10 + Math.min(newCombo * 2, 20) : 1;
    if (isCorrect) setScore((s) => s + pts);

    const newResult = {
      itemId: currentItem.key,
      char: currentItem.char,
      romaji: currentItem.romaji,
      isCorrect,
      isSlow,
      duration,
    };
    const newResults = [...results, newResult];
    setResults(newResults);

    const delay = mode === 'timed_challenge' ? 550 : 1200;
    setTimeout(() => {
      // Jika salah atau lama menjawab, masukkan ke antrean belakang untuk dilatih lagi
      const newQueue = needsRepeat ? [...queue, currentItem] : queue;
      if (needsRepeat) setQueue(newQueue);

      const nextIdx = currentIndex + 1;
      if (nextIdx < newQueue.length) {
        setCurrentIndex(nextIdx);
        setSelectedOption(null);
        setIsAnswered(false);
        setAnswerFeedback(null);
        questionStartTime.current = Date.now();
      } else {
        finishSessionWith(newResults, false);
      }
    }, delay);
  };

  const finishSession = async (timeOut) => finishSessionWith(results, timeOut);

  const finishSessionWith = async (finalResults, timeOut) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsFinished(true);
    if (finalResults.length > 0) {
      await updateBatchProgress('kana', finalResults.map((r) => ({ itemId: r.itemId, isCorrect: r.isCorrect })));
      await recordStudySession({
        mode, module: 'kana',
        score: mode === 'timed_challenge' ? score : finalResults.filter((r) => r.isCorrect && !r.isSlow).length,
        total: finalResults.length,
        startedAt: sessionStart.current,
        finishedAt: new Date().toISOString(),
      });
    }
  };

  const modeTitle = mode === 'timed_challenge' ? '⚡ Timed Challenge'
    : mode === 'weak_spot' ? '🔥 Ulangi yang Sulit' : '📖 Mode Belajar Terpadu';

  if (loading || (!currentItem && !isFinished)) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={s.loadTxt}>Menyiapkan latihan bertahap...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isFinished) {
    const total = results.length;
    const correct = results.filter((r) => r.isCorrect).length;
    const sharpCorrect = results.filter((r) => r.isCorrect && !r.isSlow).length;
    const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
    const needPracticeUniq = [...new Map(
      results.filter((r) => !r.isCorrect || r.isSlow).map((r) => [r.itemId, r])
    ).values()];

    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.resultWrap}>
          <Text style={s.resultEmoji}>{acc >= 80 ? '🎉' : acc >= 60 ? '👍' : '💪'}</Text>
          <Text style={s.resultTitle}>Sesi Selesai!</Text>
          <Text style={s.modeSub}>{modeTitle}</Text>
          <View style={s.scoreRow}>
            <Text style={s.scoreBig}>{correct}</Text>
            <Text style={s.scoreUnit}>/ {total} Benar ({acc}%)</Text>
          </View>
          <View style={s.pills}>
            {[
              ['Akurasi', `${acc}%`],
              ['Refleks Cepat', `${sharpCorrect}`],
              ['Perlu Ulang', needPracticeUniq.length],
            ].map(([l, v]) => (
              <View key={l} style={s.pill}>
                <Text style={[s.pillV, needPracticeUniq.length > 0 && l === 'Perlu Ulang' ? { color: '#ef4444' } : {}]}>{v}</Text>
                <Text style={s.pillL}>{l}</Text>
              </View>
            ))}
          </View>
          {needPracticeUniq.length > 0 && (
            <View style={s.wrongBox}>
              <Text style={s.wrongTitle}>Karakter yang salah atau lama dijawab:</Text>
              <View style={s.wrongRow}>
                {needPracticeUniq.map((w) => (
                  <TouchableOpacity key={w.itemId} style={s.wrongChip} onPress={() => playAudio(w.char)} activeOpacity={0.7}>
                    <Text style={s.wrongChar}>{w.char}</Text>
                    <Text style={s.wrongRomaji}>{w.romaji}</Text>
                    <Text style={s.chipReason}>{w.isCorrect ? '⏱️ Lambat' : '❌ Salah'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          <TouchableOpacity style={s.primaryBtn} activeOpacity={0.85} onPress={() => {
            setCurrentIndex(0); setScore(0); setCombo(0); setMaxCombo(0);
            setResults([]); setSelectedOption(null); setIsAnswered(false);
            setAnswerFeedback(null); setTimeLeft(45); setIsFinished(false);
            getProgressMap('kana').then((pMap) => {
              const reordered = mode === 'timed_challenge'
                ? shuffle(pool).slice(0, 30)
                : sortByProgressiveDifficulty(pool, pMap).slice(0, 20);
              setQueue(reordered);
              questionStartTime.current = Date.now();
            });
          }}>
            <Text style={s.primaryBtnTxt}>Ulangi Latihan 🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secBtn} onPress={() => navigation.navigate('HomeMain')}>
            <Text style={s.secBtnTxt}>Kembali ke Beranda</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const progPct = queue.length > 0 ? Math.min((currentIndex / queue.length) * 100, 100) : 0;
  const isRepeatQuestion = currentIndex >= 20;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={s.exitTxt}>✕ Keluar</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{modeTitle}</Text>
        {mode === 'timed_challenge'
          ? <View style={[s.timerBadge, timeLeft <= 10 && s.timerDanger]}><Text style={[s.timerTxt, timeLeft <= 10 && s.timerRed]}>⏱ {timeLeft}s</Text></View>
          : <Text style={s.counter}>{currentIndex + 1}/{queue.length}</Text>}
      </View>
      <View style={s.progBg}><View style={[s.progFill, { width: `${progPct}%` }]} /></View>
      <View style={s.body}>
        <View style={s.statusRow}>
          {combo > 1 ? <View style={s.comboBadge}><Text style={s.comboTxt}>🔥 {combo}x Combo!</Text></View> : <View />}
          {mode === 'timed_challenge' && <Text style={s.liveSc}>Skor: {score}</Text>}
        </View>

        <View style={s.card}>
          {isRepeatQuestion && (
            <View style={s.repeatBadge}>
              <Text style={s.repeatBadgeText}>🔁 Pengulangan</Text>
            </View>
          )}
          <Text style={s.char}>{currentItem?.char}</Text>
          <TouchableOpacity style={s.audioPip} onPress={() => playAudio(currentItem?.char)} activeOpacity={0.7}>
            <Text style={{ fontSize: 22 }}>🔊</Text>
          </TouchableOpacity>
          {mode === 'weak_spot' && <View style={s.weakTag}><Text style={s.weakTagTxt}>Sering salah</Text></View>}
        </View>

        {/* Feedback box setelah menjawab */}
        <View style={s.feedbackContainer}>
          {answerFeedback === 'perfect' && (
            <View style={[s.feedbackPill, s.feedbackPillSuccess]}>
              <Text style={s.feedbackTextSuccess}>⚡ Refleks Cepat & Tepat!</Text>
            </View>
          )}
          {answerFeedback === 'slow' && (
            <View style={[s.feedbackPill, s.feedbackPillWarning]}>
              <Text style={s.feedbackTextWarning}>⏱️ Benar, tapi agak lama. Soal akan diulang agar makin refleks!</Text>
            </View>
          )}
          {answerFeedback === 'wrong' && (
            <View style={[s.feedbackPill, s.feedbackPillDanger]}>
              <Text style={s.feedbackTextDanger}>❌ Belum tepat. Soal akan diulang di akhir sesi!</Text>
            </View>
          )}
          {!answerFeedback && (
            <Text style={s.hint}>Pilih romaji • Audio berbunyi otomatis saat memilih</Text>
          )}
        </View>

        <View style={s.opts}>
          {currentOptions.map((opt, idx) => {
            const isSel = selectedOption === opt;
            const isCorrectOpt = opt === currentItem?.romaji;
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
  headerTitle: { fontSize: 14, fontWeight: '800', color: '#0f172a', flex: 1, textAlign: 'center' },
  counter: { fontSize: 13, color: '#64748b', fontWeight: '700', minWidth: 56, textAlign: 'right' },
  timerBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, minWidth: 56, alignItems: 'center' },
  timerDanger: { backgroundColor: '#fee2e2' },
  timerTxt: { fontSize: 13, fontWeight: '800', color: '#6366f1' },
  timerRed: { color: '#dc2626' },
  progBg: { height: 4, backgroundColor: '#e2e8f0' },
  progFill: { height: 4, backgroundColor: '#6366f1', borderRadius: 2 },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, justifyContent: 'space-between' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 26 },
  comboBadge: { backgroundColor: '#ffedd5', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12 },
  comboTxt: { color: '#c2410c', fontWeight: '800', fontSize: 12 },
  liveSc: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  card: {
    backgroundColor: '#fff', borderRadius: 20, height: CARD_H,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e2e8f0', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8,
    position: 'relative',
  },
  char: { fontSize: Math.max(SH * 0.1, 68), fontWeight: '800', color: '#0f172a', includeFontPadding: false },
  audioPip: { position: 'absolute', bottom: 10, right: 12, padding: 6 },
  repeatBadge: {
    position: 'absolute', top: 10, left: 12,
    backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  repeatBadgeText: { fontSize: 10, fontWeight: '800', color: '#2563eb' },
  weakTag: { position: 'absolute', top: 10, right: 12, backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  weakTagTxt: { fontSize: 10, fontWeight: '800', color: '#b91c1c' },
  feedbackContainer: { minHeight: 28, justifyContent: 'center', alignItems: 'center', marginVertical: 4 },
  feedbackPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  feedbackPillSuccess: { backgroundColor: '#dcfce7' },
  feedbackTextSuccess: { fontSize: 12, fontWeight: '700', color: '#15803d' },
  feedbackPillWarning: { backgroundColor: '#fef3c7' },
  feedbackTextWarning: { fontSize: 11, fontWeight: '700', color: '#b45309' },
  feedbackPillDanger: { backgroundColor: '#fee2e2' },
  feedbackTextDanger: { fontSize: 11, fontWeight: '700', color: '#b91c1c' },
  hint: { fontSize: 11, color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' },
  opts: { gap: 10, marginBottom: 4 },
  optBtn: {
    backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e2e8f0', elevation: 1,
  },
  optOk: { backgroundColor: '#dcfce7', borderColor: '#16a34a' },
  optBad: { backgroundColor: '#fee2e2', borderColor: '#dc2626' },
  optTxt: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  optTxtOk: { color: '#15803d' },
  optTxtBad: { color: '#b91c1c' },
  resultWrap: { flexGrow: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  resultEmoji: { fontSize: 56, marginBottom: 8 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  modeSub: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 16 },
  scoreBig: { fontSize: 40, fontWeight: '900', color: '#6366f1' },
  scoreUnit: { fontSize: 16, fontWeight: '700', color: '#334155' },
  pills: { flexDirection: 'row', gap: 10, marginBottom: 16, width: '100%' },
  pill: { flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  pillV: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  pillL: { fontSize: 10, color: '#64748b', fontWeight: '600' },
  wrongBox: { width: '100%', marginBottom: 16 },
  wrongTitle: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 8, textAlign: 'center' },
  wrongRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  wrongChip: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12, alignItems: 'center' },
  wrongChar: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  wrongRomaji: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  chipReason: { fontSize: 9, color: '#b91c1c', fontWeight: '700', marginTop: 2 },
  primaryBtn: { backgroundColor: '#6366f1', width: '100%', paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginBottom: 10 },
  primaryBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secBtn: { width: '100%', paddingVertical: 12, alignItems: 'center' },
  secBtnTxt: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
});
