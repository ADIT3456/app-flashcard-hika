import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import hiraganaData from '../data/hiragana';
import katakanaData from '../data/katakana';
import { recordQuizAnswers } from '../utils/mastery';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate 4 multiple choice options: 1 correct + 3 unique distractors
 */
function generateOptions(targetCard, pool) {
  const correct = targetCard.romaji;
  const otherRomajis = [...new Set(pool.filter((c) => c.romaji !== correct).map((c) => c.romaji))];
  const shuffledOthers = shuffle(otherRomajis);
  const distractors = shuffledOthers.slice(0, 3);
  return shuffle([correct, ...distractors]);
}

export default function QuizScreen({ route, navigation }) {
  const category = route?.params?.category || 'hiragana';
  const questionCount = route?.params?.questionCount || 10;

  // Pool of characters based on category
  const pool = useMemo(() => {
    if (category === 'hiragana') return hiraganaData;
    if (category === 'katakana') return katakanaData;
    return [...hiraganaData, ...katakanaData];
  }, [category]);

  // Questions list
  const questions = useMemo(() => {
    const shuffled = shuffle(pool);
    const count = questionCount === 'all' ? shuffled.length : Math.min(questionCount, shuffled.length);
    return shuffled.slice(0, count);
  }, [pool, questionCount]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizResults, setQuizResults] = useState([]); // [{ card, selected, isCorrect }]
  const [isDone, setIsDone] = useState(false);

  const currentCard = questions[currentIndex];

  // Options for current question
  const currentOptions = useMemo(() => {
    if (!currentCard) return [];
    return generateOptions(currentCard, pool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentCard]);

  const progress = (currentIndex + 1) / questions.length;

  const handleSelectOption = (option) => {
    if (isAnswered) return;

    const isCorrect = option === currentCard.romaji;
    setSelectedOption(option);
    setIsAnswered(true);

    if (isCorrect) {
      setScore((s) => s + 1);
    }

    // Record result
    setQuizResults((prev) => [
      ...prev,
      {
        key: currentCard.key,
        char: currentCard.char,
        romaji: currentCard.romaji,
        selected: option,
        isCorrect,
      },
    ]);

    // Auto advance after 800ms
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        setIsDone(true);
      }
    }, 850);
  };

  // Save progress when quiz finishes
  useEffect(() => {
    if (isDone && quizResults.length > 0) {
      recordQuizAnswers(quizResults.map((r) => ({ key: r.key, isCorrect: r.isCorrect })));
    }
  }, [isDone, quizResults]);

  if (isDone) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>{percentage >= 80 ? '🏆' : percentage >= 50 ? '👍' : '💪'}</Text>
          <Text style={styles.resultTitle}>Kuis Selesai!</Text>
          <Text style={styles.scoreText}>
            Skor: <Text style={styles.scoreHighlight}>{score}</Text> / {questions.length} ({percentage}%)
          </Text>
          <Text style={styles.resultSub}>
            {percentage >= 80 ? 'Luar biasa! Penguasaanmu meningkat pesat.' : 'Terus berlatih untuk meningkatkan level mahir!'}
          </Text>

          <View style={styles.actionCol}>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => navigation.navigate('QuizSetup', { category })}
              activeOpacity={0.85}
            >
              <Text style={styles.retryBtnText}>Main Kuis Lagi 🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.progressBtn}
              onPress={() => navigation.navigate('ProgressTab')}
              activeOpacity={0.85}
            >
              <Text style={styles.progressBtnText}>Lihat Level Penguasaan 📊</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => navigation.navigate('HomeMain')}
              activeOpacity={0.85}
            >
              <Text style={styles.homeBtnText}>Kembali ke Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.exitText}>✕ Keluar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kuis {category === 'hiragana' ? 'Hiragana' : category === 'katakana' ? 'Katakana' : 'Campuran'}</Text>
        <Text style={styles.progressCounter}>{currentIndex + 1} / {questions.length}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      <View style={styles.body}>
        <Text style={styles.questionHint}>Pilih Romaji yang benar untuk karakter ini:</Text>

        {/* Big Question Card (Visual Only - No Audio) */}
        <View style={styles.questionCard}>
          <Text style={styles.bigChar}>{currentCard?.char}</Text>
        </View>

        {/* 4 Multiple Choice Options */}
        <View style={styles.optionsGrid}>
          {currentOptions.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isCorrectAnswer = opt === currentCard.romaji;

            let btnStyle = styles.optionBtn;
            let textStyle = styles.optionText;

            if (isAnswered) {
              if (isCorrectAnswer) {
                btnStyle = [styles.optionBtn, styles.optionCorrect];
                textStyle = [styles.optionText, styles.optionTextCorrect];
              } else if (isSelected && !isCorrectAnswer) {
                btnStyle = [styles.optionBtn, styles.optionWrong];
                textStyle = [styles.optionText, styles.optionTextWrong];
              }
            }

            return (
              <TouchableOpacity
                key={idx}
                style={btnStyle}
                onPress={() => handleSelectOption(opt)}
                disabled={isAnswered}
                activeOpacity={0.8}
              >
                <Text style={textStyle}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  exitText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  progressCounter: { fontSize: 14, color: '#64748b', fontWeight: '600' },

  progressBarBg: { height: 5, backgroundColor: '#e2e8f0' },
  progressBarFill: { height: 5, backgroundColor: '#2563eb', borderRadius: 3 },

  body: { flex: 1, padding: 20, justifyContent: 'space-between' },
  questionHint: { textAlign: 'center', color: '#64748b', fontSize: 14, marginTop: 4 },

  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginVertical: 10,
  },
  bigChar: {
    fontSize: 96,
    fontWeight: '800',
    color: '#1e293b',
    includeFontPadding: false,
  },

  optionsGrid: {
    gap: 12,
    marginBottom: 10,
  },
  optionBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  optionText: { fontSize: 20, fontWeight: '700', color: '#1e293b' },

  optionCorrect: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  optionTextCorrect: { color: '#15803d' },

  optionWrong: {
    backgroundColor: '#fee2e2',
    borderColor: '#dc2626',
  },
  optionTextWrong: { color: '#b91c1c' },

  resultContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultEmoji: { fontSize: 72, marginBottom: 16 },
  resultTitle: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  scoreText: { fontSize: 22, color: '#334155', fontWeight: '700', marginBottom: 8 },
  scoreHighlight: { color: '#2563eb', fontSize: 26 },
  resultSub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 36, paddingHorizontal: 20 },

  actionCol: { width: '100%', gap: 12 },
  retryBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  retryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  progressBtn: {
    backgroundColor: '#eff6ff',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2563eb',
  },
  progressBtnText: { color: '#2563eb', fontSize: 16, fontWeight: '700' },
  homeBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  homeBtnText: { color: '#64748b', fontSize: 15, fontWeight: '600' },
});
