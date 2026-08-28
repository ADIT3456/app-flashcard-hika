import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { getJLPTQuestions } from '../../data/jlpt';
import { getKotobaById } from '../../data/kotoba';
import { recordMasteryRecords } from '../../utils/mastery';

export default function JLPTPracticeScreen({ route, navigation }) {
  const level = route?.params?.level || 'N5';
  const section = route?.params?.section || 'vocabulary';

  const questions = getJLPTQuestions(level, section);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [isDone, setIsDone] = useState(false);

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelectOption = async (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQ.answerIndex;
    const namespace = level === 'N5' ? 'jlpt:n5' : 'jlpt:n4';
    await recordMasteryRecords(namespace, [{ id: currentQ.id, isCorrect }]);

    setStats((prev) => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      wrong: !isCorrect ? prev.wrong + 1 : prev.wrong,
    }));
  };

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      setIsDone(true);
    } else {
      setSelectedOption(null);
      setIsAnswered(false);
      setCurrentIndex((i) => i + 1);
    }
  };

  const playAudio = (text) => {
    Speech.speak(text, { language: 'ja-JP', pitch: 1.0, rate: 0.85 });
  };

  if (isDone) {
    const total = stats.correct + stats.wrong;
    const percent = total > 0 ? Math.round((stats.correct / total) * 100) : 0;
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>{percent >= 70 ? '🎉' : '📖'}</Text>
          <Text style={styles.doneTitle}>Latihan Selesai!</Text>
          <Text style={styles.doneSub}>Bagian: {section.toUpperCase()} • Level: {level}</Text>

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
            }}
          >
            <Text style={styles.actionBtnText}>Ulangi Latihan 🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.actionBtnSecondaryText}>Kembali ke Menu</Text>
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
        <Text style={styles.headerTitle}>{level} • {section.toUpperCase()}</Text>
        <Text style={styles.progressText}>{currentIndex + 1} / {questions.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Instruction */}
        {currentQ.instruction ? (
          <Text style={styles.instructionText}>{currentQ.instruction}</Text>
        ) : null}

        {/* Reading Passage */}
        {currentQ.passage ? (
          <View style={styles.passageCard}>
            <Text style={styles.passageText}>{currentQ.passage}</Text>
          </View>
        ) : null}

        {/* Listening Audio Button */}
        {currentQ.audioScript ? (
          <View style={styles.audioCard}>
            <Text style={styles.audioPrompt}>{currentQ.displayPrompt || 'Dengarkan percakapan berikut:'}</Text>
            <TouchableOpacity
              style={styles.audioPlayBtn}
              onPress={() => playAudio(currentQ.audioScript)}
              activeOpacity={0.8}
            >
              <Text style={styles.audioIcon}>🎧</Text>
              <Text style={styles.audioPlayText}>Putar Audio Percakapan</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Question Prompt */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQ.question}</Text>
          {currentQ.furigana ? (
            <Text style={styles.furiganaText}>{currentQ.furigana}</Text>
          ) : null}
        </View>

        {/* Options */}
        <View style={styles.optionsList}>
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.answerIndex;

            let optionStyle = styles.optionItem;
            let textStyle = styles.optionText;

            if (isAnswered) {
              if (isCorrect) {
                optionStyle = [styles.optionItem, styles.optionCorrect];
                textStyle = [styles.optionText, styles.optionTextCorrect];
              } else if (isSelected && !isCorrect) {
                optionStyle = [styles.optionItem, styles.optionWrong];
                textStyle = [styles.optionText, styles.optionTextWrong];
              }
            }

            return (
              <TouchableOpacity
                key={idx}
                style={optionStyle}
                onPress={() => handleSelectOption(idx)}
                disabled={isAnswered}
                activeOpacity={0.7}
              >
                <View style={styles.optionIndexBadge}>
                  <Text style={styles.optionIndexText}>{String.fromCharCode(65 + idx)}</Text>
                </View>
                <Text style={textStyle}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation & Related Vocab */}
        {isAnswered && (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationHeading}>
              {selectedOption === currentQ.answerIndex ? '✅ Jawaban Benar!' : '❌ Jawaban Salah'}
            </Text>
            <Text style={styles.explanationBody}>{currentQ.explanation}</Text>

            {/* Related Kotoba Link */}
            {currentQ.relatedVocabulary && currentQ.relatedVocabulary.length > 0 && (
              <View style={styles.relatedVocabBox}>
                <Text style={styles.relatedVocabTitle}>📖 Kosakata Terkait:</Text>
                <View style={styles.relatedChipsRow}>
                  {currentQ.relatedVocabulary.map((wordId) => {
                    const w = getKotobaById(wordId);
                    if (!w) return null;
                    return (
                      <TouchableOpacity
                        key={wordId}
                        style={styles.relatedChip}
                        onPress={() => navigation.navigate('KotobaDetail', { wordId: w.id })}
                      >
                        <Text style={styles.relatedChipText}>
                          {w.word} ({w.meaning_id}) →
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Footer Next Button */}
      {isAnswered && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>
              {currentIndex >= questions.length - 1 ? 'Lihat Hasil Latihan →' : 'Soal Berikutnya →'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    borderBottomColor: '#f1f5f9',
  },
  backText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  progressText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  body: { padding: 16, paddingBottom: 40 },

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
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  questionText: { fontSize: 18, fontWeight: '800', color: '#0f172a', lineHeight: 26 },
  furiganaText: { fontSize: 13, color: '#64748b', marginTop: 6 },

  optionsList: { gap: 10, marginBottom: 16 },
  optionItem: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  optionIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIndexText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  optionText: { fontSize: 15, color: '#1e293b', flex: 1, fontWeight: '500' },

  optionCorrect: { backgroundColor: '#dcfce7', borderColor: '#22c55e' },
  optionTextCorrect: { color: '#15803d', fontWeight: '700' },
  optionWrong: { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
  optionTextWrong: { color: '#b91c1c', fontWeight: '700' },

  explanationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 8,
  },
  explanationHeading: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  explanationBody: { fontSize: 14, lineHeight: 22, color: '#334155', marginBottom: 12 },

  relatedVocabBox: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  relatedVocabTitle: { fontSize: 13, fontWeight: '700', color: '#2563eb', marginBottom: 6 },
  relatedChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  relatedChip: {
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  relatedChipText: { fontSize: 12, color: '#1d4ed8', fontWeight: '600' },

  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  nextBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  doneContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  doneEmoji: { fontSize: 64, marginBottom: 16 },
  doneTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  doneSub: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  scoreBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 32,
  },
  scoreNum: { fontSize: 36, fontWeight: '800', color: '#16a34a', marginBottom: 4 },
  scoreDetail: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  actionBtn: {
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
