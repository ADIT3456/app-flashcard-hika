import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import hiraganaData from '../data/hiragana';
import katakanaData from '../data/katakana';
import { ALL_KOTOBA } from '../data/kotoba';
import { loadProgress, getMasteryLevel, getNamespaceData, calculateMastery } from '../utils/mastery';

export default function HomeScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [stats, setStats] = useState({ mastered: 0, learning: 0, unlearned: 0, total: 92 });
  const [kotobaStats, setKotobaStats] = useState({ mastered: 0, total: 1000 });

  useEffect(() => {
    if (isFocused) {
      loadProgress().then((progress) => {
        const all = [...hiraganaData, ...katakanaData];
        let mastered = 0;
        let learning = 0;
        let unlearned = 0;
        all.forEach((item) => {
          const level = getMasteryLevel(progress[item.key]);
          if (level === 'mastered') mastered++;
          else if (level === 'learning') learning++;
          else unlearned++;
        });
        setStats({ mastered, learning, unlearned, total: all.length });
      });

      getNamespaceData('kotoba').then((kData) => {
        let mastered = 0;
        ALL_KOTOBA.forEach((w) => {
          if (calculateMastery(kData?.[w.id]) === 'mastered') mastered++;
        });
        setKotobaStats({ mastered, total: ALL_KOTOBA.length });
      });
    }
  }, [isFocused]);

  const goToSetup = (type) => {
    navigation.navigate('SessionSetup', { type });
  };

  const goToQuiz = (category) => {
    navigation.navigate('QuizSetup', { category });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hika Flashcard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.welcome}>Selamat Datang!</Text>
        <Text style={styles.subtitle}>Pusat belajar Hiragana, Katakana, Kosakata, & JLPT.</Text>

        {/* Progress Snapshot Card */}
        <TouchableOpacity
          style={styles.statsCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ProgressTab')}
        >
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>📊 Ringkasan Penguasaan Kana</Text>
            <Text style={styles.statsLink}>Lihat Detail →</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#16a34a' }]}>{stats.mastered}</Text>
              <Text style={styles.statLabel}>🟢 Mahir</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#d97706' }]}>{stats.learning}</Text>
              <Text style={styles.statLabel}>🟡 Belajar</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#94a3b8' }]}>{stats.unlearned}</Text>
              <Text style={styles.statLabel}>⚪ Belum</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Feature Banner: 1000 Kotoba */}
        <TouchableOpacity
          style={styles.kotobaBanner}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('KotobaTab')}
        >
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerIcon}>📖</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.bannerTag}>
                <Text style={styles.bannerTagText}>1000 KOSAKATA</Text>
              </View>
              <Text style={styles.bannerTitle}>Kotoba N5 & N4</Text>
              <Text style={styles.bannerDesc}>
                {kotobaStats.mastered}/{kotobaStats.total} kata dikuasai • 30 kategori tematik
              </Text>
            </View>
          </View>
          <Text style={styles.bannerArrow}>→</Text>
        </TouchableOpacity>

        {/* Feature Banner: JLPT Practice */}
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
              <Text style={styles.bannerTitle}>JLPT N5 & N4 Practice</Text>
              <Text style={styles.bannerDesc}>
                Kosakata, Tata Bahasa, Membaca, & Listening
              </Text>
            </View>
          </View>
          <Text style={styles.bannerArrow}>→</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>📚 Flashcard Karakter Kana</Text>
        <View style={styles.cardRow}>
          {/* Hiragana Card */}
          <TouchableOpacity style={styles.studyCard} onPress={() => goToSetup('hiragana')} activeOpacity={0.85}>
            <Text style={styles.nativeChar}>あ</Text>
            <Text style={styles.cardLabel}>Hiragana</Text>
            <Text style={styles.cardCount}>46 Karakter</Text>
          </TouchableOpacity>

          {/* Katakana Card */}
          <TouchableOpacity style={styles.studyCard} onPress={() => goToSetup('katakana')} activeOpacity={0.85}>
            <Text style={styles.nativeChar}>ア</Text>
            <Text style={styles.cardLabel}>Katakana</Text>
            <Text style={styles.cardCount}>46 Karakter</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>🎯 Mode Kuis Kana</Text>
        <TouchableOpacity
          style={styles.quizBanner}
          activeOpacity={0.85}
          onPress={() => goToQuiz('all')}
        >
          <View style={styles.quizInfo}>
            <Text style={styles.quizBannerTitle}>Uji Hafalan Huruf</Text>
            <Text style={styles.quizBannerDesc}>Tebak romaji dari Hiragana & Katakana</Text>
          </View>
          <View style={styles.quizPlayBtn}>
            <Text style={styles.quizPlayText}>Mulai Kuis</Text>
          </View>
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  statsLink: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: '500' },

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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
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
  bannerTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  bannerDesc: { fontSize: 12, color: '#64748b' },
  bannerArrow: { fontSize: 20, fontWeight: '800', color: '#2563eb', marginLeft: 8 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 12 },
  cardRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  studyCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  nativeChar: {
    fontSize: 60,
    fontWeight: '700',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardLabel: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  cardCount: { fontSize: 12, color: '#64748b', marginTop: 2 },

  quizBanner: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quizInfo: { flex: 1, marginRight: 12 },
  quizBannerTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
  quizBannerDesc: { fontSize: 12, color: '#94a3b8' },
  quizPlayBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  quizPlayText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
