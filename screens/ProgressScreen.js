import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import hiraganaData from '../data/hiragana';
import katakanaData from '../data/katakana';
import { loadProgress, getMasteryLevel, resetProgress, MASTERY_CONFIG } from '../utils/mastery';

export default function ProgressScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [filter, setFilter] = useState('all'); // 'all' | 'hiragana' | 'katakana'
  const [progressMap, setProgressMap] = useState({});

  const refreshData = () => {
    loadProgress().then((data) => setProgressMap(data || {}));
  };

  useEffect(() => {
    if (isFocused) {
      refreshData();
    }
  }, [isFocused]);

  const allItems = useMemo(() => {
    if (filter === 'hiragana') return hiraganaData;
    if (filter === 'katakana') return katakanaData;
    return [...hiraganaData, ...katakanaData];
  }, [filter]);

  // Calculate summary stats
  const stats = useMemo(() => {
    let mastered = 0;
    let learning = 0;
    let unlearned = 0;

    allItems.forEach((item) => {
      const lvl = getMasteryLevel(progressMap[item.key]);
      if (lvl === 'mastered') mastered++;
      else if (lvl === 'learning') learning++;
      else unlearned++;
    });

    const total = allItems.length;
    const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return { mastered, learning, unlearned, total, percentage };
  }, [allItems, progressMap]);

  const handleReset = () => {
    Alert.alert(
      'Reset Progress',
      'Apakah kamu yakin ingin mereset semua data riwayat kuis dan level penguasaan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetProgress();
            refreshData();
          },
        },
      ]
    );
  };

  const playSound = (item) => {
    Speech.speak(item.char, { language: 'ja-JP', pitch: 1.0, rate: 0.9 });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Level Penguasaan Karakter</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Overall Mastery Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <Text style={styles.summaryHeading}>Tingkat Penguasaan</Text>
            <Text style={styles.summaryPercent}>{stats.percentage}%</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.barContainer}>
            <View style={[styles.barFill, { width: `${stats.percentage}%` }]} />
          </View>

          {/* Badge Counts */}
          <View style={styles.badgeRow}>
            <View style={[styles.badgePill, { backgroundColor: MASTERY_CONFIG.mastered.bg }]}>
              <Text style={[styles.badgeText, { color: MASTERY_CONFIG.mastered.color }]}>
                🟢 {stats.mastered} Mahir
              </Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: MASTERY_CONFIG.learning.bg }]}>
              <Text style={[styles.badgeText, { color: MASTERY_CONFIG.learning.color }]}>
                🟡 {stats.learning} Belajar
              </Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: MASTERY_CONFIG.unlearned.bg }]}>
              <Text style={[styles.badgeText, { color: MASTERY_CONFIG.unlearned.color }]}>
                ⚪ {stats.unlearned} Belum
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Segmented Control */}
        <View style={styles.filterRow}>
          {[
            { id: 'all', label: 'Semua (92)' },
            { id: 'hiragana', label: 'Hiragana (46)' },
            { id: 'katakana', label: 'Katakana (46)' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.filterBtn, filter === tab.id && styles.filterBtnActive]}
              onPress={() => setFilter(tab.id)}
            >
              <Text style={[styles.filterBtnText, filter === tab.id && styles.filterBtnTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Grid of Characters */}
        <Text style={styles.gridSectionTitle}>Daftar Karakter ({allItems.length})</Text>
        <Text style={styles.tapHint}>Ketuk karakter untuk mendengar pengucapannya 🔊</Text>

        <View style={styles.charGrid}>
          {allItems.map((item) => {
            const level = getMasteryLevel(progressMap[item.key]);
            const config = MASTERY_CONFIG[level];
            const itemStat = progressMap[item.key] || { attempts: 0, streak: 0 };

            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.charBox, { borderColor: config.color }]}
                onPress={() => playSound(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.charIndicator, { backgroundColor: config.color }]} />
                <Text style={styles.boxChar}>{item.char}</Text>
                <Text style={styles.boxRomaji}>{item.romaji}</Text>
                {itemStat.attempts > 0 && (
                  <Text style={styles.boxStreak}>🔥{itemStat.streak}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer Actions */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>Reset Riwayat Progress</Text>
          </TouchableOpacity>
        </View>
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
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  body: { padding: 20 },

  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryHeading: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  summaryPercent: { fontSize: 24, fontWeight: '800', color: '#16a34a' },
  barContainer: {
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  barFill: { height: '100%', backgroundColor: '#16a34a', borderRadius: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  badgePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  badgeText: { fontSize: 12, fontWeight: '700' },

  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  filterBtnActive: { backgroundColor: '#fff', elevation: 1 },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  filterBtnTextActive: { color: '#0f172a', fontWeight: '700' },

  gridSectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  tapHint: { fontSize: 12, color: '#94a3b8', marginBottom: 14 },

  charGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  charBox: {
    width: '18%',
    aspectRatio: 0.85,
    backgroundColor: '#fff',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  charIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  boxChar: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    includeFontPadding: false,
  },
  boxRomaji: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  boxStreak: {
    fontSize: 9,
    color: '#d97706',
    fontWeight: '700',
    position: 'absolute',
    bottom: 2,
  },

  footerRow: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  resetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  resetBtnText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
});
