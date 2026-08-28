import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { generateMockTest } from '../../data/jlpt';
import { recordMasteryRecords } from '../../utils/mastery';

export default function JLPTMockTestScreen({ route, navigation }) {
  const level = route?.params?.level || 'N5';
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 menit
  const timerRef = useRef(null);

  useEffect(() => {
    const mockList = generateMockTest(level, 10);
    setQuestions(mockList);

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(mockList, userAnswers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSelect = (optionIndex) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const handleSubmit = async (testQuestions = questions, answers = userAnswers) => {
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    const records = [];

    testQuestions.forEach((q, idx) => {
      const isCorrect = answers[idx] === q.answerIndex;
      if (isCorrect) correctCount++;
      records.push({ id: q.id, isCorrect });
    });

    const namespace = level === 'N5' ? 'jlpt:n5' : 'jlpt:n4';
    await recordMasteryRecords(namespace, records);

    navigation.replace('JLPTResult', {
      level,
      questions: testQuestions,
      userAnswers: answers,
      correctCount,
      totalCount: testQuestions.length,
      timeSpent: 900 - secondsRemaining,
    });
  };

  const confirmSubmit = () => {
    const answeredCount = Object.keys(userAnswers).length;
    Alert.alert(
      'Kumpulkan Jawaban?',
      `Kamu telah menjawab ${answeredCount} dari ${questions.length} soal. Apakah kamu yakin ingin menyelesaikan ujian?`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Kumpulkan', onPress: () => handleSubmit() },
      ]
    );
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const selectedOpt = userAnswers[currentIndex];

  const playAudio = (text) => {
    Speech.speak(text, { language: 'ja-JP', pitch: 1.0, rate: 0.85 });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>✕ Keluar</Text>
        </TouchableOpacity>
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>⏳ {formatTimer(secondsRemaining)}</Text>
        </View>
        <TouchableOpacity style={styles.submitBtn} onPress={confirmSubmit}>
          <Text style={styles.submitBtnText}>Selesai</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Dots */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dotsBar}>
        {questions.map((_, idx) => {
          const isAnswered = userAnswers[idx] !== undefined;
          const isCurrent = idx === currentIndex;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.dot,
                isAnswered && styles.dotAnswered,
                isCurrent && styles.dotCurrent,
              ]}
              onPress={() => setCurrentIndex(idx)}
            >
              <Text
                style={[
                  styles.dotText,
                  isAnswered && styles.dotTextAnswered,
                  isCurrent && styles.dotTextCurrent,
                ]}
              >
                {idx + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Question Body */}
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.secTypeBadge}>
          <Text style={styles.secTypeText}>{currentQ.section.toUpperCase()}</Text>
        </View>

        {currentQ.instruction ? (
          <Text style={styles.instructionText}>{currentQ.instruction}</Text>
        ) : null}

        {currentQ.passage ? (
          <View style={styles.passageCard}>
            <Text style={styles.passageText}>{currentQ.passage}</Text>
          </View>
        ) : null}

        {currentQ.audioScript ? (
          <View style={styles.audioCard}>
            <Text style={styles.audioPrompt}>{currentQ.displayPrompt || 'Dengarkan audio berikut:'}</Text>
            <TouchableOpacity
              style={styles.audioPlayBtn}
              onPress={() => playAudio(currentQ.audioScript)}
            >
              <Text style={styles.audioIcon}>🎧</Text>
              <Text style={styles.audioPlayText}>Putar Audio Percakapan</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            {currentIndex + 1}. {currentQ.question}
          </Text>
        </View>

        <View style={styles.optionsList}>
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOpt === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.optionItem, isSelected && styles.optionSelected]}
                onPress={() => handleSelect(idx)}
                activeOpacity={0.7}
              >
                <View style={[styles.optIndexBadge, isSelected && styles.optIndexBadgeSelected]}>
                  <Text style={[styles.optIndexText, isSelected && styles.optIndexTextSelected]}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navBtnText}>← Sebelumnya</Text>
        </TouchableOpacity>

        {currentIndex < questions.length - 1 ? (
          <TouchableOpacity
            style={styles.navBtnPrimary}
            onPress={() => setCurrentIndex((i) => i + 1)}
          >
            <Text style={styles.navBtnPrimaryText}>Berikutnya →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navBtnSubmit} onPress={confirmSubmit}>
            <Text style={styles.navBtnPrimaryText}>Kumpulkan Jawaban ✓</Text>
          </TouchableOpacity>
        )}
      </View>
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
    borderBottomColor: '#e2e8f0',
  },
  backText: { fontSize: 14, color: '#ef4444', fontWeight: '700' },
  timerBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  timerText: { fontSize: 14, fontWeight: '800', color: '#b45309' },
  submitBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  dotsBar: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    maxHeight: 50,
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  dotAnswered: { backgroundColor: '#dbeafe', borderColor: '#3b82f6' },
  dotCurrent: { borderWidth: 2, borderColor: '#1d4ed8' },
  dotText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  dotTextAnswered: { color: '#1d4ed8', fontWeight: '700' },
  dotTextCurrent: { color: '#1d4ed8', fontWeight: '800' },

  body: { padding: 16, paddingBottom: 30 },
  secTypeBadge: {
    backgroundColor: '#f1f5f9',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  secTypeText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  instructionText: { fontSize: 13, color: '#64748b', marginBottom: 12, fontWeight: '500' },

  passageCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  passageText: { fontSize: 15, lineHeight: 24, color: '#1e293b' },

  audioCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 14,
    alignItems: 'center',
  },
  audioPrompt: { fontSize: 13, color: '#1e40af', fontWeight: '600', marginBottom: 10 },
  audioPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  audioIcon: { fontSize: 18 },
  audioPlayText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  questionText: { fontSize: 17, fontWeight: '800', color: '#0f172a', lineHeight: 24 },

  optionsList: { gap: 10 },
  optionItem: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  optionSelected: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  optIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optIndexBadgeSelected: { backgroundColor: '#2563eb' },
  optIndexText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  optIndexTextSelected: { color: '#fff' },
  optionText: { fontSize: 15, color: '#1e293b', flex: 1, fontWeight: '500' },
  optionTextSelected: { color: '#1d4ed8', fontWeight: '700' },

  footer: {
    backgroundColor: '#fff',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  navBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 14, fontWeight: '700', color: '#475569' },
  navBtnPrimary: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  navBtnSubmit: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  navBtnPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
