// screens/HomeScreen.js
// Dashboard Utama Hika Flashcard (Redesain MARU Concept & SQLite Live Stats)

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { ALL_KOTOBA } from '../data/kotoba';
import { getNamespaceData, calculateMastery } from '../utils/mastery';
import { getProgressSummary, getKanaCategoryMastery, getWeakKana } from '../db';

export default function HomeScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [stats, setStats] = useState({ mastered: 0, learning: 0, unlearned: 92, total: 92, percentage: 0 });
  const [categoryStats, setCategoryStats] = useState({
    hiragana: { mastered: 0, learning: 0, unlearned: 46, total: 46, percentage: 0 },
    katakana: { mastered: 0, learning: 0, unlearned: 46, total: 46, percentage: 0 },
  });
  const [weakCount, setWeakCount] = useState(0);
  const [kotobaStats, setKotobaStats] = useState({ mastered: 0, total: 1000 });

  useEffect(() => {
    if (isFocused) {
      // 1. Ambil ringkasan keseluruhan
      getProgressSummary('kana', 92).then(setStats).catch(console.warn);

      // 2. Ambil penguasaan spesifik Hiragana & Katakana
      getKanaCategoryMastery().then(setCategoryStats).catch(console.warn);

      // 3. Cek karakter sulit / sering salah
      getWeakKana(50).then((items) => setWeakCount(items.length)).catch(console.warn);

      // 4. Statistik Kotoba
      getNamespaceData('kotoba').then((kData) => {
        let mastered = 0;
        ALL_KOTOBA.forEach((w) => {
          if (calculateMastery(kData?.[w.id]) === 'mastered') mastered++;
        });
        setKotobaStats({ mastered, total: ALL_KOTOBA.length });
      });
    }
  }, [isFocused]);

  const startPractice = (mode, category = 'all') => {
    navigation.navigate('KanaPractice', { mode, category });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hika Flashcard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.welcome}>Selamat Datang!</Text>
        <Text style={styles.subtitle}>Pusat belajar Hiragana, Katakana, Kosakata, & JLPT.</Text>

        {/* Category Mastery Progress Card */}
        <TouchableOpacity
          style={styles.statsCard}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('ProgressTab')}
        >
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>📊 Tingkat Penguasaan Kana</Text>
            <Text style={styles.statsLink}>Detail →</Text>
          </View>

          {/* Progress split: Hiragana vs Katakana */}
          <View style={styles.kanaSplitRow}>
            {/* Hiragana Col */}
            <View style={styles.kanaCol}>
              <View style={styles.colHeader}>
                <Text style={styles.colName}>Hiragana</Text>
                <Text style={styles.colPercent}>{categoryStats.hiragana.percentage}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${categoryStats.hiragana.percentage}%`, backgroundColor: '#2563eb' }]} />
              </View>
              <Text style={styles.colCount}>{categoryStats.hiragana.mastered} / 46 Mahir</Text>
            </View>

            <View style={styles.colDivider} />

            {/* Katakana Col */}
            <View style={styles.kanaCol}>
              <View style={styles.colHeader}>
                <Text style={styles.colName}>Katakana</Text>
                <Text style={styles.colPercent}>{categoryStats.katakana.percentage}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${categoryStats.katakana.percentage}%`, backgroundColor: '#0284c7' }]} />
              </View>
              <Text style={styles.colCount}>{categoryStats.katakana.mastered} / 46 Mahir</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Weak Spot Practice Alert Banner (Tampil bila ada karakter yang salah/learning) */}
        {weakCount > 0 && (
          <TouchableOpacity
            style={styles.weakSpotBanner}
            activeOpacity={0.85}
            onPress={() => startPractice('weak_spot')}
          >
            <View style={styles.weakLeft}>
              <Text style={styles.weakIcon}>🔥</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.weakTitle}>Ulangi yang Sulit ({weakCount} Huruf)</Text>
                <Text style={styles.weakDesc}>
                  Fokus latih karakter yang pernah salah agar cepat mahir.
                </Text>
              </View>
            </View>
            <Text style={styles.weakArrow}>→</Text>
          </TouchableOpacity>
        )}


        {/* Section: Mode Latihan Interaktif Kana */}
        <Text style={styles.sectionTitle}>🎯 Mode Latihan Interaktif Kana</Text>

        {/* Mode Belajar — primary full-width card */}
        <TouchableOpacity
          style={styles.belajarCard}
          onPress={() => startPractice('belajar')}
          activeOpacity={0.85}
        >
          <View style={styles.belajarLeft}>
            <Text style={styles.belajarIcon}>📖</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.belajarTitle}>Mode Belajar</Text>
              <Text style={styles.belajarDesc}>
                Lihat karakter → pilih romaji → dengar audio. Soal salah diulang otomatis, bertahap dari yang belum dikuasai.
              </Text>
            </View>
          </View>
          <Text style={styles.belajarArrow}>→</Text>
        </TouchableOpacity>

        {/* Grid 2-col untuk mode lain */}
        <View style={styles.practiceGrid}>
          <TouchableOpacity
            style={styles.modeCard}
            onPress={() => startPractice('timed_challenge')}
            activeOpacity={0.85}
          >
            <View style={[styles.modeIconBg, { backgroundColor: '#fee2e2' }]}>
              <Text style={styles.modeIcon}>⚡</Text>
            </View>
            <Text style={styles.modeTitle}>Timed Challenge</Text>
            <Text style={styles.modeDesc}>45 detik, uji kecepatan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modeCard}
            onPress={() => startPractice('weak_spot')}
            activeOpacity={0.85}
          >
            <View style={[styles.modeIconBg, { backgroundColor: '#fef3c7' }]}>
              <Text style={styles.modeIcon}>🔥</Text>
            </View>
            <Text style={styles.modeTitle}>Ulangi yang Sulit</Text>
            <Text style={styles.modeDesc}>Fokus huruf yang sering salah</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modeCard}
            onPress={() => navigation.navigate('KatakanaWords')}
            activeOpacity={0.85}
          >
            <View style={[styles.modeIconBg, { backgroundColor: '#e0e7ff' }]}>
              <Text style={styles.modeIcon}>🔤</Text>
            </View>
            <Text style={styles.modeTitle}>Kata Katakana</Text>
            <Text style={styles.modeDesc}>Kata serapan & audio</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Flashcard Klasik */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>📚 Flashcard Karakter</Text>
        <View style={styles.cardRow}>
          <TouchableOpacity
            style={styles.studyCard}
            onPress={() => navigation.navigate('SessionSetup', { type: 'hiragana' })}
            activeOpacity={0.85}
          >
            <Text style={styles.nativeChar}>あ</Text>
            <Text style={styles.cardLabel}>Hiragana</Text>
            <Text style={styles.cardCount}>46 Karakter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.studyCard}
            onPress={() => navigation.navigate('SessionSetup', { type: 'katakana' })}
            activeOpacity={0.85}
          >
            <Text style={[styles.nativeChar, { color: '#0284c7' }]}>ア</Text>
            <Text style={styles.cardLabel}>Katakana</Text>
            <Text style={styles.cardCount}>46 Karakter</Text>
          </TouchableOpacity>
        </View>

        {/* Modul Eksternal: Kotoba & JLPT */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>🚀 Modul Lanjutan</Text>
        <TouchableOpacity
          style={styles.kotobaBanner}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('KotobaTab')}
        >
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerIcon}>📖</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.bannerTag}>
                <Text style={styles.bannerTagText}>KOSAKATA & TATA BAHASA</Text>
              </View>
              <Text style={styles.bannerTitle}>Kosakata Kurikulum Minna</Text>
              <Text style={styles.bannerDesc}>
                Bab 1–50 bertahap dari pemula sampai menengah
              </Text>
            </View>
          </View>
          <Text style={styles.bannerArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.jlptBanner}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('JLPTTab')}
        >
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerIcon}>🏆</Text>
            <View style={{ flex: 1 }}>
              <View style={[styles.bannerTag, { backgroundColor: '#fef3c7' }]}>
                <Text style={[styles.bannerTagText, { color: '#b45309' }]}>LATIHAN & UJIAN</Text>
              </View>
              <Text style={styles.bannerTitle}>JLPT Practice Center</Text>
              <Text style={styles.bannerDesc}>
                Latihan soal & Simulasi ujian N5, N4, N3
              </Text>
            </View>
          </View>
          <Text style={styles.bannerArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  body: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  welcome: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 18 },

  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statsTitle: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
  statsLink: { fontSize: 13, color: '#2563eb', fontWeight: '700' },

  kanaSplitRow: { flexDirection: 'row', alignItems: 'center' },
  kanaCol: { flex: 1 },
  colDivider: { width: 1, height: 44, backgroundColor: '#e2e8f0', marginHorizontal: 14 },
  colHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  colName: { fontSize: 13, fontWeight: '700', color: '#334155' },
  colPercent: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  progressBarBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  colCount: { fontSize: 11, color: '#64748b', fontWeight: '500' },

  weakSpotBanner: {
    backgroundColor: '#fff1f2',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: '#fecdd3',
  },
  weakLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  weakIcon: { fontSize: 28 },
  weakTitle: { fontSize: 15, fontWeight: '800', color: '#be123c', marginBottom: 2 },
  weakDesc: { fontSize: 12, color: '#e11d48' },
  weakArrow: { fontSize: 18, fontWeight: '800', color: '#be123c', marginLeft: 8 },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 12 },

  practiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  modeCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  modeIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modeIcon: { fontSize: 20 },
  modeTitle: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  modeDesc: { fontSize: 11, color: '#64748b', lineHeight: 15 },

  cardRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  studyCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  nativeChar: {
    fontSize: 48,
    fontWeight: '800',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 4,
    includeFontPadding: false,
  },
  cardLabel: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  cardCount: { fontSize: 11, color: '#64748b', marginTop: 2 },

  kotobaBanner: {
    backgroundColor: '#eff6ff',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  jlptBanner: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  bannerIcon: { fontSize: 32 },
  bannerTag: {
    backgroundColor: '#dbeafe',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  bannerTagText: { fontSize: 10, fontWeight: '800', color: '#1d4ed8' },
  bannerTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  bannerDesc: { fontSize: 12, color: '#64748b' },
  bannerArrow: { fontSize: 18, fontWeight: '800', color: '#2563eb', marginLeft: 8 },

  // Belajar mode — primary card
  belajarCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#86efac',
  },
  belajarLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  belajarIcon: { fontSize: 28, marginTop: 2 },
  belajarTitle: { fontSize: 15, fontWeight: '800', color: '#15803d', marginBottom: 3 },
  belajarDesc: { fontSize: 12, color: '#166534', lineHeight: 17 },
  belajarArrow: { fontSize: 18, fontWeight: '800', color: '#15803d', marginLeft: 8 },
});

