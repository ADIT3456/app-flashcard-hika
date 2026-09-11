// screens/JLPT/JLPTPracticeScreen.js
// Latihan Soal JLPT per Section (Moji-Goi, Bunpou, Dokkai, Choukai) dari SQLite Lokal

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { getJLPTQuestionsFromDB, updateItemProgress, recordStudySession } from '../../db';

export default function JLPTPracticeScreen({ route, navigation }) {
  const level = route?.params?.level || 'N5';
  const section = route?.params?.section || 'moji_goi';

  const [questions, setQuestions] = useState([]);
  const [initialCount, setInitialCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [isDone, setIsDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const sessionStartTime = useRef(new Date().toISOString());

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getJLPTQuestionsFromDB(level, section);
        if (active) {
          setQuestions(data);
          setInitialCount(data.length);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error loading JLPT practice questions:', err);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [level, section]);

  const currentQ = questions[currentIndex];

  const playAudio = (text) => {
    Speech.stop();
    Speech.speak(text, { language: 'ja-JP', pitch: 1.0, rate: 0.85 });
  };

  const handleSelectOption = async (index) => {
    if (isAnswered || !currentQ) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQ.answerIndex;
    await updateItemProgress(`jlpt_${level.toLowerCase()}`, currentQ.id, isCorrect);

    setStats((prev) => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      wrong: !isCorrect ? prev.wrong + 1 : prev.wrong,
    }));
  };

  const handleNext = async () => {
    const isCorrect = selectedOption === currentQ.answerIndex;
    let nextQuestions = questions;
    if (!isCorrect) {
      // Re-queue soal yang salah agar dilatih terus sampai benar
      nextQuestions = [...questions, currentQ];
      setQuestions(nextQuestions);
    }

    if (currentIndex >= nextQuestions.length - 1) {
      await recordStudySession({
        mode: `practice_${section}`,
        module: 'jlpt',
        score: stats.correct,
        total: initialCount || questions.length,
        startedAt: sessionStartTime.current,
        finishedAt: new Date().toISOString(),
      });
      setIsDone(true);
    } else {
      setSelectedOption(null);
      setIsAnswered(false);
      setCurrentIndex((i) => i + 1);
    }
  };


  if (loading || !currentQ) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ marginTop: 12, color: '#64748b' }}>Memuat soal latihan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isDone) {
    const total = initialCount || questions.length;
    const percent = total > 0 ? Math.round((stats.correct / total) * 100) : 0;

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.doneContainer}>
          <Text style={styles.doneEmoji}>{percent >= 70 ? '🎉' : '📖'}</Text>
          <Text style={styles.doneTitle}>Latihan Selesai!</Text>
          <Text style={styles.doneSub}>JLPT {level} • {section.toUpperCase()}</Text>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreNum}>{percent}%</Text>
            <Text style={styles.scoreDetail}>{stats.correct} Benar dari {total} Soal</Text>
          </View>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              setCurrentIndex(0);
              setSelectedOption(null);
              setIsAnswered(false);
              setStats({ correct: 0, wrong: 0 });
              setIsDone(false);
              setQuestions(questions.slice(0, initialCount));
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>Ulangi Latihan 🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnSecondaryText}>Kembali ke Menu JLPT</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const totalDisplay = initialCount || questions.length;
  const progressPercent = Math.min(((currentIndex + 1) / questions.length) * 100, 100);
  const isRepeat = currentIndex >= totalDisplay;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>← Keluar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{level} • {section.toUpperCase()}</Text>
        <Text style={styles.progressText}>{Math.min(currentIndex + 1, totalDisplay)} / {totalDisplay}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={styles.questionSectionBadge}>{currentQ.section.toUpperCase()}</Text>
            {isRepeat && (
              <View style={styles.repeatBadge}>
                <Text style={styles.repeatBadgeText}>🔁 Pengulangan</Text>
              </View>
            )}
          </View>
          <Text style={styles.questionText}>{currentQ.questionText}</Text>

          {/* Audio Button for Listening Questions */}
          {section === 'choukai' && (
            <TouchableOpacity
              style={styles.audioPlayBtn}
              onPress={() => playAudio(currentQ.questionText)}
              activeOpacity={0.8}
            >
              <Text style={styles.audioIcon}>🔊</Text>
              <Text style={styles.audioText}>Putar Audio Soal (Dialog)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 4 Choices */}
        <View style={styles.optionsList}>
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.answerIndex;

            let cardStyle = styles.optionCard;
            let textStyle = styles.optionText;

            if (isAnswered) {
              if (isCorrect) {
                cardStyle = [styles.optionCard, styles.optionCorrect];
                textStyle = [styles.optionText, styles.optionTextCorrect];
              } else if (isSelected && !isCorrect) {
                cardStyle = [styles.optionCard, styles.optionWrong];
                textStyle = [styles.optionText, styles.optionTextWrong];
              }
            }

            return (
              <TouchableOpacity
                key={idx}
                style={cardStyle}
                onPress={() => handleSelectOption(idx)}
                disabled={isAnswered}
                activeOpacity={0.8}
              >
                <View style={styles.optionIndexPill}>
                  <Text style={styles.optionIndexText}>{idx + 1}</Text>
                </View>
                <Text style={textStyle}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation Card */}
        {isAnswered && (
          <View style={styles.explanationCard}>
            <View style={styles.expHeader}>
              <Text style={styles.expTitle}>💡 Pembahasan & Penjelasan</Text>
            </View>
            <Text style={styles.expContent}>{currentQ.explanation}</Text>

            <TouchableOpacity
              style={styles.nextBtn}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>
                {currentIndex === questions.length - 1 ? 'Lihat Hasil 🏁' : 'Soal Berikutnya →'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  backText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  progressText: { fontSize: 14, color: '#64748b', fontWeight: '700' },

  progressBarBg: { height: 5, backgroundColor: '#e2e8f0' },
  progressBarFill: { height: 5, backgroundColor: '#2563eb', borderRadius: 3 },

  body: { padding: 16, paddingBottom: 36 },

  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  questionSectionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: '800',
    color: '#2563eb',
  },
  repeatBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  repeatBadgeText: { fontSize: 10, fontWeight: '800', color: '#b45309' },
  questionText: { fontSize: 16, color: '#0f172a', fontWeight: '700', lineHeight: 26 },


  audioPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fbcfe8',
  },
  audioIcon: { fontSize: 18 },
  audioText: { fontSize: 13, fontWeight: '700', color: '#be185d' },

  optionsList: { gap: 10, marginBottom: 16 },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    gap: 12,
  },
  optionIndexPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIndexText: { fontSize: 13, fontWeight: '800', color: '#475569' },
  optionText: { fontSize: 16, fontWeight: '700', color: '#1e293b', flex: 1 },

  optionCorrect: { backgroundColor: '#dcfce7', borderColor: '#16a34a' },
  optionTextCorrect: { color: '#15803d' },
  optionWrong: { backgroundColor: '#fee2e2', borderColor: '#dc2626' },
  optionTextWrong: { color: '#b91c1c' },

  explanationCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  expHeader: { marginBottom: 8 },
  expTitle: { fontSize: 14, fontWeight: '800', color: '#1e40af' },
  expContent: { fontSize: 13, color: '#334155', lineHeight: 20, marginBottom: 16 },

  nextBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  doneContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  doneEmoji: { fontSize: 56, marginBottom: 12 },
  doneTitle: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  doneSub: { fontSize: 14, color: '#64748b', marginBottom: 24 },
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
  scoreNum: { fontSize: 48, fontWeight: '900', color: '#2563eb', marginBottom: 4 },
  scoreDetail: { fontSize: 14, color: '#64748b', fontWeight: '600' },

  actionBtn: {
    backgroundColor: '#2563eb',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  actionBtnSecondary: { width: '100%', paddingVertical: 14, alignItems: 'center' },
  actionBtnSecondaryText: { color: '#64748b', fontSize: 15, fontWeight: '600' },
});
