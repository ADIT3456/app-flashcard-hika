import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getKotobaById } from '../../data/kotoba';

export default function JLPTResultScreen({ route, navigation }) {
  const {
    level = 'N5',
    questions = [],
    userAnswers = {},
    correctCount = 0,
    totalCount = 10,
    timeSpent = 0,
  } = route?.params || {};

  const percent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const isPassed = percent >= 60;

  // Section breakdown
  const sectionStats = {};
  questions.forEach((q, idx) => {
    if (!sectionStats[q.section]) sectionStats[q.section] = { total: 0, correct: 0 };
    sectionStats[q.section].total++;
    if (userAnswers[idx] === q.answerIndex) sectionStats[q.section].correct++;
  });

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hasil Simulasi Ujian {level}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('JLPTHome')} hitSlop={12}>
          <Text style={styles.closeBtnText}>Selesai ✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Pass/Fail Card */}
        <View style={[styles.resultCard, isPassed ? styles.resultCardPass : styles.resultCardFail]}>
          <Text style={styles.resultEmoji}>{isPassed ? '🏆' : '📚'}</Text>
          <Text style={styles.resultTitle}>{isPassed ? 'LULUS (合格) !' : 'BELUM LULUS (不合格)'}</Text>
          <Text style={styles.resultSub}>
            {isPassed ? 'Selamat! Skor kamu telah melampaui batas standar kelulusan.' : 'Jangan berkecil hati, pelajari kembali topik yang masih lemah.'}
          </Text>

          <View style={styles.scoreRow}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreBig}>{percent}%</Text>
              <Text style={styles.scoreLabel}>Akurasi</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.scoreItem}>
              <Text style={styles.scoreBig}>{correctCount}/{totalCount}</Text>
              <Text style={styles.scoreLabel}>Soal Benar</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.scoreItem}>
              <Text style={styles.scoreBig}>{formatTime(timeSpent)}</Text>
              <Text style={styles.scoreLabel}>Waktu</Text>
            </View>
          </View>
        </View>

        {/* Breakdown Per Section */}
        <Text style={styles.sectionHeader}>Analisis Per Bagian</Text>
        <View style={styles.breakdownList}>
          {Object.entries(sectionStats).map(([sec, stat]) => {
            const secPercent = Math.round((stat.correct / stat.total) * 100);
            return (
              <View key={sec} style={styles.breakdownItem}>
                <View style={styles.breakdownTop}>
                  <Text style={styles.breakdownName}>{sec.toUpperCase()}</Text>
                  <Text style={styles.breakdownScore}>{stat.correct}/{stat.total} ({secPercent}%)</Text>
                </View>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${secPercent}%`,
                        backgroundColor: secPercent >= 60 ? '#16a34a' : '#ef4444',
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Detailed Question Review */}
        <Text style={styles.sectionHeader}>Review Jawaban & Pembahasan</Text>
        <View style={styles.reviewList}>
          {questions.map((q, idx) => {
            const userChoice = userAnswers[idx];
            const isCorrect = userChoice === q.answerIndex;
            return (
              <View key={q.id || idx} style={styles.reviewCard}>
                <View style={styles.reviewCardHeader}>
                  <Text style={styles.reviewQNum}>No. {idx + 1} ({q.section.toUpperCase()})</Text>
                  <View style={[styles.statusBadge, isCorrect ? styles.statusBadgePass : styles.statusBadgeFail]}>
                    <Text style={[styles.statusText, isCorrect ? styles.statusTextPass : styles.statusTextFail]}>
                      {isCorrect ? '✅ Benar' : '❌ Salah'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.reviewQuestion}>{q.question}</Text>

                <View style={styles.answerCompare}>
                  <Text style={styles.answerText}>
                    Jawabanmu: <Text style={isCorrect ? styles.ansCorrect : styles.ansWrong}>{userChoice !== undefined ? q.options[userChoice] : 'Tidak dijawab'}</Text>
                  </Text>
                  {!isCorrect && (
                    <Text style={styles.answerText}>
                      Kunci Jawaban: <Text style={styles.ansCorrect}>{q.options[q.answerIndex]}</Text>
                    </Text>
                  )}
                </View>

                <Text style={styles.explanationText}>💡 {q.explanation}</Text>

                {/* Related Kotoba Link */}
                {q.relatedVocabulary && q.relatedVocabulary.length > 0 && (
                  <View style={styles.relatedVocabBox}>
                    <Text style={styles.relatedTitle}>Pelajari Kosakata di Kotoba:</Text>
                    <View style={styles.relatedChips}>
                      {q.relatedVocabulary.map((wordId) => {
                        const w = getKotobaById(wordId);
                        if (!w) return null;
                        return (
                          <TouchableOpacity
                            key={wordId}
                            style={styles.relatedChip}
                            onPress={() => navigation.navigate('KotobaDetail', { wordId: w.id })}
                          >
                            <Text style={styles.relatedChipText}>
                              {w.word} ({w.meaning_id}) ↗
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
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
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  closeBtnText: { fontSize: 14, fontWeight: '700', color: '#2563eb' },
  body: { padding: 16, paddingBottom: 40 },

  resultCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  resultCardPass: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  resultCardFail: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  resultEmoji: { fontSize: 48, marginBottom: 8 },
  resultTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  resultSub: { fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 16 },

  scoreRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
  },
  scoreItem: { alignItems: 'center' },
  scoreBig: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  scoreLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  divider: { width: 1, height: 28, backgroundColor: '#e2e8f0' },

  sectionHeader: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 12, marginTop: 4 },
  breakdownList: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20, gap: 14 },
  breakdownItem: {},
  breakdownTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  breakdownName: { fontSize: 13, fontWeight: '700', color: '#334155' },
  breakdownScore: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  barBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },

  reviewList: { gap: 14 },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reviewCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewQNum: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusBadgePass: { backgroundColor: '#dcfce7' },
  statusBadgeFail: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextPass: { color: '#15803d' },
  statusTextFail: { color: '#b91c1c' },

  reviewQuestion: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 10, lineHeight: 22 },
  answerCompare: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 10, marginBottom: 10, gap: 4 },
  answerText: { fontSize: 13, color: '#475569' },
  ansCorrect: { color: '#16a34a', fontWeight: '700' },
  ansWrong: { color: '#ef4444', fontWeight: '700' },

  explanationText: { fontSize: 13, color: '#334155', lineHeight: 20 },

  relatedVocabBox: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  relatedTitle: { fontSize: 12, fontWeight: '700', color: '#2563eb', marginBottom: 6 },
  relatedChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  relatedChip: {
    backgroundColor: '#eff6ff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  relatedChipText: { fontSize: 12, color: '#1d4ed8', fontWeight: '600' },
});
