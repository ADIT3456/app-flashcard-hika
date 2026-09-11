// screens/JLPT/JLPTHomeScreen.js
// Pusat Latihan & Simulasi Ujian JLPT (N5, N4, N3) Berbasis SQLite Lokal

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { getJLPTQuestionsFromDB, getJLPTStatsSummary } from '../../db';

export const JLPT_SECTIONS_LIST = [
  { id: 'moji_goi', label: 'Huruf & Kosakata', sub: 'Moji & Goi', icon: '📖', color: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  { id: 'bunpou', label: 'Tata Bahasa', sub: 'Bunpou', icon: '📐', color: '#fef3c7', border: '#fde68a', text: '#b45309' },
  { id: 'dokkai', label: 'Pemahaman Bacaan', sub: 'Dokkai', icon: '📄', color: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  { id: 'choukai', label: 'Mendengarkan', sub: 'Choukai (Audio)', icon: '🎧', color: '#fdf2f8', border: '#fbcfe8', text: '#be185d' },
];

export default function JLPTHomeScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [level, setLevel] = useState('N5'); // 'N5' | 'N4' | 'N3'
  const [stats, setStats] = useState({ answered: 0, correct: 0, total: 0, accuracy: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = async (lvl) => {
    try {
      setLoading(true);
      const summary = await getJLPTStatsSummary(lvl);
      setStats(summary);
    } catch (err) {
      console.warn('Error loading JLPT stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadData(level);
    }
  }, [isFocused, level]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>JLPT Training Center</Text>
        <TouchableOpacity
          style={styles.statsBtn}
          onPress={() => navigation.navigate('JLPTProgress')}
          activeOpacity={0.8}
        >
          <Text style={styles.statsBtnText}>📊 Riwayat</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Level Switcher (N5, N4, N3) */}
        <View style={styles.levelSwitcher}>
          {['N5', 'N4', 'N3'].map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[styles.levelBtn, level === lvl && styles.levelBtnActive]}
              onPress={() => setLevel(lvl)}
              activeOpacity={0.8}
            >
              <Text style={[styles.levelBtnText, level === lvl && styles.levelBtnTextActive]}>
                JLPT {lvl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Level Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryTitle}>Target Level {level}</Text>
              <Text style={styles.summarySub}>
                {stats.answered} dari {stats.total} soal starter dikerjakan
              </Text>
            </View>
            <View style={styles.accBadge}>
              <Text style={styles.accValue}>{stats.accuracy}%</Text>
              <Text style={styles.accLabel}>Akurasi</Text>
            </View>
          </View>
          <View style={styles.barBg}>
            <View
              style={[
                styles.barFill,
                { width: `${(stats.answered / Math.max(stats.total, 1)) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Full Mock Exam Banner */}
        <TouchableOpacity
          style={styles.mockBanner}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('JLPTMockTest', { level })}
        >
          <View style={styles.mockBannerLeft}>
            <Text style={styles.mockEmoji}>⏱️</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.mockTag}>
                <Text style={styles.mockTagText}>SIMULASI LENGKAP</Text>
              </View>
              <Text style={styles.mockTitle}>Simulasi Ujian Resmi {level}</Text>
              <Text style={styles.mockSub}>
                Semua bagian berurutan dengan batas waktu dan pembobotan skor
              </Text>
            </View>
          </View>
          <Text style={styles.mockArrow}>→</Text>
        </TouchableOpacity>

        {/* Section Cards */}
        <Text style={styles.sectionHeader}>Latihan Berdasarkan Bagian Soal</Text>
        <Text style={styles.sectionSub}>Pilih bagian spesifik untuk melatih fokus pemahaman</Text>

        <View style={styles.sectionsGrid}>
          {JLPT_SECTIONS_LIST.map((sec) => (
            <TouchableOpacity
              key={sec.id}
              style={[styles.sectionCard, { backgroundColor: sec.color, borderColor: sec.border }]}
              onPress={() => navigation.navigate('JLPTPractice', { level, section: sec.id })}
              activeOpacity={0.85}
            >
              <View style={styles.secTopRow}>
                <Text style={styles.secIcon}>{sec.icon}</Text>
                <Text style={[styles.secTag, { color: sec.text }]}>{sec.sub}</Text>
              </View>
              <Text style={styles.secTitle}>{sec.label}</Text>
              <Text style={styles.secAction}>Mulai Latihan →</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  statsBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statsBtnText: { fontSize: 12, fontWeight: '700', color: '#475569' },

  body: { padding: 16, paddingBottom: 36 },

  levelSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    gap: 4,
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
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  levelBtnText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  levelBtnTextActive: { color: '#2563eb', fontWeight: '800' },

  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  summarySub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  accBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  accValue: { fontSize: 16, fontWeight: '800', color: '#2563eb' },
  accLabel: { fontSize: 10, fontWeight: '600', color: '#64748b' },
  barBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 3 },

  mockBanner: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  mockBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  mockEmoji: { fontSize: 32 },
  mockTag: {
    backgroundColor: '#334155',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  mockTagText: { fontSize: 9, fontWeight: '800', color: '#38bdf8' },
  mockTitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 2 },
  mockSub: { fontSize: 11, color: '#94a3b8', lineHeight: 15 },
  mockArrow: { fontSize: 20, fontWeight: '800', color: '#38bdf8', marginLeft: 8 },

  sectionHeader: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  sectionSub: { fontSize: 12, color: '#64748b', marginBottom: 14 },

  sectionsGrid: { gap: 12 },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
  },
  secTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  secIcon: { fontSize: 24 },
  secTag: { fontSize: 11, fontWeight: '800' },
  secTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  secAction: { fontSize: 13, fontWeight: '700', color: '#2563eb' },
});
