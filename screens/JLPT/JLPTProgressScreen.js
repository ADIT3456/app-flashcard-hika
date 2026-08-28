import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getJLPTQuestions, JLPT_SECTIONS } from '../../data/jlpt';
import { getNamespaceData } from '../../utils/mastery';

export default function JLPTProgressScreen({ navigation }) {
  const [level, setLevel] = useState('N5');
  const [history, setHistory] = useState({});

  useEffect(() => {
    async function loadData() {
      const data = await getNamespaceData(level === 'N5' ? 'jlpt:n5' : 'jlpt:n4');
      setHistory(data || {});
    }
    loadData();
  }, [level]);

  const questions = getJLPTQuestions(level, 'all');

  let totalAttempts = 0;
  let totalCorrect = 0;
  questions.forEach((q) => {
    const stat = history[q.id];
    if (stat) {
      totalAttempts += stat.attempts || 0;
      totalCorrect += stat.correct || 0;
    }
  });

  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progres & Statistik JLPT</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Level Switcher */}
        <View style={styles.levelSwitcher}>
          <TouchableOpacity
            style={[styles.levelBtn, level === 'N5' && styles.levelBtnActive]}
            onPress={() => setLevel('N5')}
          >
            <Text style={[styles.levelBtnText, level === 'N5' && styles.levelBtnTextActive]}>JLPT N5</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.levelBtn, level === 'N4' && styles.levelBtnActive]}
            onPress={() => setLevel('N4')}
          >
            <Text style={[styles.levelBtnText, level === 'N4' && styles.levelBtnTextActive]}>JLPT N4</Text>
          </TouchableOpacity>
        </View>

        {/* Overview Stats */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Performa Keseluruhan {level}</Text>
          <View style={styles.overviewRow}>
            <View style={styles.overviewBox}>
              <Text style={styles.overviewNum}>{overallAccuracy}%</Text>
              <Text style={styles.overviewLabel}>Akurasi Total</Text>
            </View>
            <View style={styles.overviewBox}>
              <Text style={styles.overviewNum}>{totalAttempts}</Text>
              <Text style={styles.overviewLabel}>Total Dikerjakan</Text>
            </View>
            <View style={styles.overviewBox}>
              <Text style={[styles.overviewNum, { color: '#16a34a' }]}>{totalCorrect}</Text>
              <Text style={styles.overviewLabel}>Jawaban Benar</Text>
            </View>
          </View>
        </View>

        {/* Section Mastery */}
        <Text style={styles.sectionHeader}>Penguasaan Per Bagian</Text>
        <View style={styles.sectionList}>
          {JLPT_SECTIONS.filter((s) => s.id !== 'all').map((sec) => {
            const secQuestions = getJLPTQuestions(level, sec.id);
            let secAttempts = 0;
            let secCorrect = 0;

            secQuestions.forEach((q) => {
              const stat = history[q.id];
              if (stat) {
                secAttempts += stat.attempts || 0;
                secCorrect += stat.correct || 0;
              }
            });

            const secAcc = secAttempts > 0 ? Math.round((secCorrect / secAttempts) * 100) : 0;

            return (
              <View key={sec.id} style={styles.secItemCard}>
                <View style={styles.secItemTop}>
                  <View style={styles.secItemLeft}>
                    <Text style={styles.secIcon}>{sec.icon}</Text>
                    <Text style={styles.secItemTitle}>{sec.label}</Text>
                  </View>
                  <Text style={styles.secItemAcc}>{secAcc}%</Text>
                </View>

                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${secAcc}%`,
                        backgroundColor: secAcc >= 70 ? '#16a34a' : secAcc >= 40 ? '#eab308' : '#cbd5e1',
                      },
                    ]}
                  />
                </View>

                <View style={styles.secItemBottom}>
                  <Text style={styles.secSubText}>
                    {secCorrect} benar dari {secAttempts} percobaan ({secQuestions.length} soal tersedia)
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('JLPTPractice', { level, section: sec.id })}
                  >
                    <Text style={styles.secLinkText}>Latihan →</Text>
                  </TouchableOpacity>
                </View>
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
  backText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  body: { padding: 16, paddingBottom: 40 },

  levelSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  levelBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
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

  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  overviewTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 14 },
  overviewRow: { flexDirection: 'row', justifyContent: 'space-around' },
  overviewBox: { alignItems: 'center' },
  overviewNum: { fontSize: 22, fontWeight: '800', color: '#2563eb', marginBottom: 2 },
  overviewLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },

  sectionHeader: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginBottom: 12 },
  sectionList: { gap: 12 },
  secItemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  secItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secIcon: { fontSize: 20 },
  secItemTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  secItemAcc: { fontSize: 14, fontWeight: '800', color: '#334155' },
  barBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  barFill: { height: '100%', borderRadius: 3 },
  secItemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  secSubText: { fontSize: 11, color: '#64748b' },
  secLinkText: { fontSize: 12, color: '#2563eb', fontWeight: '700' },
});
