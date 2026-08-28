import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { JLPT_SECTIONS, getJLPTQuestions } from '../../data/jlpt';
import { getNamespaceData } from '../../utils/mastery';

export default function JLPTHomeScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [level, setLevel] = useState('N5'); // 'N5' | 'N4'
  const [historyN5, setHistoryN5] = useState({});
  const [historyN4, setHistoryN4] = useState({});

  useEffect(() => {
    async function loadData() {
      const d5 = await getNamespaceData('jlpt:n5');
      const d4 = await getNamespaceData('jlpt:n4');
      setHistoryN5(d5 || {});
      setHistoryN4(d4 || {});
    }
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const currentHistory = level === 'N5' ? historyN5 : historyN4;
  const questions = getJLPTQuestions(level, 'all');

  // Compute stats
  let answeredCount = 0;
  let correctCount = 0;
  questions.forEach((q) => {
    const stat = currentHistory[q.id];
    if (stat && stat.attempts > 0) {
      answeredCount++;
      if (stat.correct > 0) correctCount++;
    }
  });

  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>JLPT Practice Center</Text>
        <TouchableOpacity
          style={styles.statsBtn}
          onPress={() => navigation.navigate('JLPTProgress')}
          activeOpacity={0.8}
        >
          <Text style={styles.statsBtnText}>📊 Statistik</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Level Switcher */}
        <View style={styles.levelSwitcher}>
          <TouchableOpacity
            style={[styles.levelBtn, level === 'N5' && styles.levelBtnActive]}
            onPress={() => setLevel('N5')}
            activeOpacity={0.8}
          >
            <Text style={[styles.levelBtnText, level === 'N5' && styles.levelBtnTextActive]}>
              JLPT N5 (Pemula)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.levelBtn, level === 'N4' && styles.levelBtnActive]}
            onPress={() => setLevel('N4')}
            activeOpacity={0.8}
          >
            <Text style={[styles.levelBtnText, level === 'N4' && styles.levelBtnTextActive]}>
              JLPT N4 (Dasar Lanjut)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Level Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryTitle}>Target {level}</Text>
              <Text style={styles.summarySub}>{answeredCount} dari {questions.length} soal sudah dikerjakan</Text>
            </View>
            <View style={styles.accBadge}>
              <Text style={styles.accValue}>{accuracy}%</Text>
              <Text style={styles.accLabel}>Akurasi</Text>
            </View>
          </View>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${(answeredCount / Math.max(questions.length, 1)) * 100}%` }]} />
          </View>
        </View>

        {/* Mock Exam Banner */}
        <TouchableOpacity
          style={styles.mockBanner}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('JLPTMockTest', { level })}
        >
          <View style={styles.mockBannerLeft}>
            <Text style={styles.mockEmoji}>⏱️</Text>
            <View>
              <Text style={styles.mockTitle}>Simulasi Ujian {level} (Mock Test)</Text>
              <Text style={styles.mockSub}>Mode tes berbatas waktu dengan acak soal campuran</Text>
            </View>
          </View>
          <Text style={styles.mockArrow}>→</Text>
        </TouchableOpacity>

        {/* Sections Header */}
        <Text style={styles.sectionHeader}>Latihan Berdasarkan Bagian</Text>

        {/* Section Cards */}
        <View style={styles.sectionsGrid}>
          {JLPT_SECTIONS.filter((s) => s.id !== 'all').map((sec) => {
            const secQuestions = getJLPTQuestions(level, sec.id);
            let secDone = 0;
            secQuestions.forEach((q) => {
              if (currentHistory[q.id]?.attempts > 0) secDone++;
            });

            return (
              <TouchableOpacity
                key={sec.id}
                style={styles.secCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('JLPTPractice', { level, section: sec.id })}
              >
                <View style={styles.secCardTop}>
                  <Text style={styles.secIcon}>{sec.icon}</Text>
                  <Text style={styles.secCount}>{secDone}/{secQuestions.length} Soal</Text>
                </View>
                <Text style={styles.secTitle}>{sec.label}</Text>
                <Text style={styles.secActionText}>Mulai Latihan →</Text>
              </TouchableOpacity>
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  statsBtn: {
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  statsBtnText: { color: '#2563eb', fontSize: 13, fontWeight: '700' },
  body: { padding: 16, paddingBottom: 30 },

  levelSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  levelBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  levelBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  levelBtnText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  levelBtnTextActive: { color: '#2563eb', fontWeight: '800' },

  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  summarySub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  accBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  accValue: { fontSize: 16, fontWeight: '800', color: '#16a34a' },
  accLabel: { fontSize: 10, fontWeight: '600', color: '#15803d' },
  barBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#2563eb' },

  mockBanner: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mockBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  mockEmoji: { fontSize: 28 },
  mockTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  mockSub: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  mockArrow: { color: '#fff', fontSize: 20, fontWeight: '800' },

  sectionHeader: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginBottom: 12 },
  sectionsGrid: { gap: 12 },
  secCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  secIcon: { fontSize: 24 },
  secCount: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  secTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  secActionText: { fontSize: 13, color: '#2563eb', fontWeight: '700' },
});
