// screens/Kotoba/KotobaListScreen.js
// Pusat Kosakata: Kurikulum 50 Bab Minna no Nihongo (SQLite) & 1000 Kosakata Tematik

import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Modal, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { ALL_KOTOBA, filterKotoba, getKotobaCategories } from '../../data/kotoba';
import {
  getNamespaceData,
  getFavoritesList,
  toggleFavorite,
  calculateMastery,
  MASTERY_CONFIG,
} from '../../utils/mastery';
import { getContentUnits, getVocabProgressSummary } from '../../db';

export default function KotobaListScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = useState('minna'); // 'minna' | 'thematic'

  // Minna 50 Chapters States
  const [minnaUnits, setMinnaUnits] = useState([]);
  const [minnaLoading, setMinnaLoading] = useState(true);
  const [minnaLevel, setMinnaLevel] = useState('all'); // 'all' | 'n5' | 'n4'
  const [minnaStats, setMinnaStats] = useState({ mastered: 0, total: 0, percentage: 0 });

  // Thematic States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all' | 'N5' | 'N4'
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [masteryFilter, setMasteryFilter] = useState('all');
  const [masteryData, setMasteryData] = useState({});
  const [favoritesMap, setFavoritesMap] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const categories = useMemo(() => getKotobaCategories(), []);

  const refreshAll = async () => {
    try {
      // 1. Minna Units from SQLite
      const units = await getContentUnits('vocab');
      setMinnaUnits(units);
      const vStats = await getVocabProgressSummary();
      setMinnaStats(vStats);
      setMinnaLoading(false);

      // 2. Thematic Data
      const mData = await getNamespaceData('kotoba');
      const fData = await getFavoritesList();
      setMasteryData(mData || {});
      setFavoritesMap(fData || {});
    } catch (err) {
      console.warn('Error refreshing kotoba:', err);
    }
  };

  useEffect(() => {
    if (isFocused) {
      refreshAll();
    }
  }, [isFocused]);

  // Filtered Minna Units
  const filteredMinnaUnits = useMemo(() => {
    return minnaUnits.filter((u) => {
      const matchSearch =
        u.title.toLowerCase().includes(search.toLowerCase()) ||
        u.level_or_bab.toLowerCase().includes(search.toLowerCase());

      const babNum = parseInt(u.level_or_bab.replace(/\D/g, ''), 10) || 0;
      let matchLevel = true;
      if (minnaLevel === 'n5') matchLevel = babNum <= 25;
      if (minnaLevel === 'n4') matchLevel = babNum > 25;

      return matchSearch && matchLevel;
    });
  }, [minnaUnits, search, minnaLevel]);

  // Filtered Thematic Words
  const filteredWords = useMemo(() => {
    return filterKotoba({
      category: selectedCategory,
      level: selectedLevel,
      search,
      isFavorite: onlyFavorites,
      favoritesMap,
      masteryMap: masteryData,
      masteryFilter,
    });
  }, [selectedCategory, selectedLevel, search, onlyFavorites, favoritesMap, masteryData, masteryFilter]);

  // Thematic stats
  const thematicStats = useMemo(() => {
    let mastered = 0;
    ALL_KOTOBA.forEach((w) => {
      if (calculateMastery(masteryData[w.id]) === 'mastered') mastered++;
    });
    const total = ALL_KOTOBA.length;
    const percent = Math.round((mastered / total) * 100);
    return { mastered, total, percent };
  }, [masteryData]);

  const handleToggleFav = async (wordId) => {
    const isFav = await toggleFavorite(wordId);
    setFavoritesMap((prev) => {
      const next = { ...prev };
      if (isFav) next[wordId] = true;
      else delete next[wordId];
      return next;
    });
  };

  const renderMinnaUnit = ({ item }) => (
    <View style={styles.minnaCard}>
      <View style={styles.minnaCardHeader}>
        <View style={styles.minnaBabBadge}>
          <Text style={styles.minnaBabText}>{item.level_or_bab}</Text>
        </View>
        <Text style={styles.minnaWordCount}>
          {item.sort_order <= 25 ? 'Level N5' : 'Level N4'} • {item.word_count || 5} Kosakata
        </Text>
      </View>

      <Text style={styles.minnaTitle}>{item.title}</Text>

      <View style={styles.minnaBtnRow}>
        <TouchableOpacity
          style={styles.minnaDetailBtn}
          onPress={() => navigation.navigate('MinnaChapterDetail', {
            unitId: item.id,
            bab: item.level_or_bab,
            title: item.title,
          })}
          activeOpacity={0.8}
        >
          <Text style={styles.minnaDetailBtnText}>Materi 📖</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.minnaFlashcardBtn}
          onPress={() => navigation.navigate('MinnaFlashcard', {
            unitId: item.id,
            bab: item.level_or_bab,
            title: item.title,
            mode: 'sequential',
          })}
          activeOpacity={0.8}
        >
          <Text style={styles.minnaFlashcardBtnText}>Kartu 🎴</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.minnaQuizBtn}
          onPress={() => navigation.navigate('MinnaQuiz', {
            unitId: item.id,
            bab: item.level_or_bab,
            title: item.title,
          })}
          activeOpacity={0.8}
        >
          <Text style={styles.minnaQuizBtnText}>Tes 📝</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderThematicWord = ({ item }) => {
    const itemMastery = calculateMastery(masteryData[item.id]);
    const config = MASTERY_CONFIG[itemMastery];
    const isFav = !!favoritesMap[item.id];

    return (
      <TouchableOpacity
        style={styles.wordCard}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('KotobaDetail', { wordId: item.id })}
      >
        <View style={styles.wordMain}>
          <View style={styles.wordTopRow}>
            <Text style={styles.wordKanji}>{item.word}</Text>
            <View style={styles.badgeGroup}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{item.level}</Text>
              </View>
              <View style={[styles.masteryPill, { backgroundColor: config.bg }]}>
                <Text style={[styles.masteryPillText, { color: config.color }]}>
                  {config.badge} {config.label}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.wordReading}>{item.reading} • <Text style={styles.wordRomaji}>{item.romaji}</Text></Text>
          <Text style={styles.wordMeaning} numberOfLines={1}>{item.meaning_id}</Text>
        </View>

        <TouchableOpacity
          style={styles.favBtn}
          onPress={() => handleToggleFav(item.id)}
          hitSlop={8}
        >
          <Text style={{ fontSize: 20 }}>{isFav ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kamus & Materi Kosakata</Text>
      </View>

      {/* Segmented Mode Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'minna' && styles.tabBtnActive]}
          onPress={() => setActiveTab('minna')}
          activeOpacity={0.85}
        >
          <Text style={[styles.tabText, activeTab === 'minna' && styles.tabTextActive]}>
            📚 50 Bab Minna
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'thematic' && styles.tabBtnActive]}
          onPress={() => setActiveTab('thematic')}
          activeOpacity={0.85}
        >
          <Text style={[styles.tabText, activeTab === 'thematic' && styles.tabTextActive]}>
            🗂️ 1000 Kosakata Tematik
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Card */}
      {activeTab === 'minna' ? (
        <>
          <View style={styles.progressCard}>
            <View style={styles.progressTop}>
              <Text style={styles.progressHeading}>Kurikulum 50 Bab Minna no Nihongo</Text>
              <Text style={styles.progressPercent}>{minnaStats.percentage}% Mahir</Text>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${minnaStats.percentage}%` }]} />
            </View>
            <Text style={styles.progressSubtext}>
              Mencakup Bab 1–25 (N5 Dasar) & Bab 26–50 (N4 Pra-Menengah)
            </Text>
          </View>

          {/* Banner Tes Hafalan Kosakata 50 Bab */}
          <View style={styles.grandQuizCard}>
            <View style={styles.grandQuizHeader}>
              <Text style={styles.grandQuizIcon}>🎯</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.grandQuizTitle}>Tes Hafalan Kosakata Bab 1–50</Text>
                <Text style={styles.grandQuizDesc}>
                  Uji sejauh mana hafalan kosakatamu dengan pilihan ganda acak
                </Text>
              </View>
            </View>
            <View style={styles.grandQuizBtnRow}>
              <TouchableOpacity
                style={styles.grandQuizBtnAll}
                onPress={() => navigation.navigate('MinnaQuiz', { scope: 'all_50' })}
                activeOpacity={0.85}
              >
                <Text style={styles.grandQuizBtnAllText}>Tes Semua (Bab 1–50) 🚀</Text>
              </TouchableOpacity>
              <View style={styles.grandQuizSubRow}>
                <TouchableOpacity
                  style={styles.grandQuizBtnSub}
                  onPress={() => navigation.navigate('MinnaQuiz', { scope: 'n5' })}
                  activeOpacity={0.85}
                >
                  <Text style={styles.grandQuizBtnSubText}>N5 (Bab 1–25)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.grandQuizBtnSub}
                  onPress={() => navigation.navigate('MinnaQuiz', { scope: 'n4' })}
                  activeOpacity={0.85}
                >
                  <Text style={styles.grandQuizBtnSubText}>N4 (Bab 26–50)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressHeading}>1000 Kosakata Tematik</Text>
            <Text style={styles.progressPercent}>{thematicStats.percent}% ({thematicStats.mastered}/{thematicStats.total})</Text>
          </View>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${thematicStats.percent}%` }]} />
          </View>
          <Text style={styles.progressSubtext}>30 Kategori Kosakata Tematik N5 & N4</Text>
        </View>
      )}

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={activeTab === 'minna' ? 'Cari judul bab atau topik...' : 'Cari kanji, reading, romaji, arti...'}
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Sub Filters */}
      {activeTab === 'minna' ? (
        <View style={styles.filterBar}>
          {[
            { id: 'all', label: 'Semua (50 Bab)' },
            { id: 'n5', label: 'N5 (Bab 1-25)' },
            { id: 'n4', label: 'N4 (Bab 26-50)' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.filterChip, minnaLevel === item.id && styles.filterChipActive]}
              onPress={() => setMinnaLevel(item.id)}
            >
              <Text style={[styles.filterChipText, minnaLevel === item.id && styles.filterChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterChip, selectedCategory !== 'all' && styles.filterChipActive]}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={[styles.filterChipText, selectedCategory !== 'all' && styles.filterChipTextActive]}>
              {selectedCategory === 'all' ? '📁 Semua Kategori' : categories.find((c) => c.id === selectedCategory)?.labelID || 'Kategori'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChipSmall, selectedLevel === 'N5' && styles.filterChipActive]}
            onPress={() => setSelectedLevel(selectedLevel === 'N5' ? 'all' : 'N5')}
          >
            <Text style={[styles.filterChipText, selectedLevel === 'N5' && styles.filterChipTextActive]}>N5</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChipSmall, selectedLevel === 'N4' && styles.filterChipActive]}
            onPress={() => setSelectedLevel(selectedLevel === 'N4' ? 'all' : 'N4')}
          >
            <Text style={[styles.filterChipText, selectedLevel === 'N4' && styles.filterChipTextActive]}>N4</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChipSmall, onlyFavorites && styles.filterChipActive]}
            onPress={() => setOnlyFavorites(!onlyFavorites)}
          >
            <Text style={{ fontSize: 13 }}>⭐</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Word / Chapter Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {activeTab === 'minna'
            ? `Menampilkan ${filteredMinnaUnits.length} Bab`
            : `Menampilkan ${filteredWords.length} kata`}
        </Text>
      </View>

      {/* List */}
      {activeTab === 'minna' ? (
        minnaLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <FlatList
            data={filteredMinnaUnits}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderMinnaUnit}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        <FlatList
          data={filteredWords}
          keyExtractor={(item) => item.id}
          renderItem={renderThematicWord}
          contentContainerStyle={styles.listContent}
          initialNumToRender={20}
          maxToRenderPerBatch={25}
          windowSize={10}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Category Modal for Thematic */}
      <Modal visible={showCategoryModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Kategori (30 Tema)</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.modalCloseText}>Tutup ✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              <TouchableOpacity
                style={[styles.catOption, selectedCategory === 'all' && styles.catOptionActive]}
                onPress={() => {
                  setSelectedCategory('all');
                  setShowCategoryModal(false);
                }}
              >
                <Text style={[styles.catOptionText, selectedCategory === 'all' && styles.catOptionTextActive]}>
                  📁 Semua Kategori
                </Text>
              </TouchableOpacity>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.catOption, selectedCategory === c.id && styles.catOptionActive]}
                  onPress={() => {
                    setSelectedCategory(c.id);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[styles.catOptionText, selectedCategory === c.id && styles.catOptionTextActive]}>
                    {c.icon} {c.labelID} ({c.labelJP})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },

  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  tabTextActive: { color: '#2563eb', fontWeight: '800' },

  progressCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressHeading: { fontSize: 13, fontWeight: '700', color: '#334155' },
  progressPercent: { fontSize: 13, fontWeight: '800', color: '#2563eb' },
  barBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  barFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 3 },
  progressSubtext: { fontSize: 11, color: '#94a3b8' },

  searchContainer: { marginHorizontal: 16, marginTop: 12 },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },

  filterBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  filterChipSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  filterChipActive: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  filterChipTextActive: { color: '#2563eb', fontWeight: '700' },

  countRow: { marginHorizontal: 16, marginTop: 10, marginBottom: 6 },
  countText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },

  listContent: { paddingHorizontal: 16, paddingBottom: 30, gap: 10 },

  // Minna Chapter Card
  minnaCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  minnaCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  minnaBabBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  minnaBabText: { fontSize: 11, fontWeight: '800', color: '#1d4ed8' },
  minnaWordCount: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  minnaTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 14 },
  minnaBtnRow: { flexDirection: 'row', gap: 8 },
  minnaDetailBtn: {
    flex: 1,
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  minnaDetailBtnText: { color: '#2563eb', fontSize: 12, fontWeight: '700' },
  minnaFlashcardBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  minnaFlashcardBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  minnaQuizBtn: {
    flex: 1,
    backgroundColor: '#fdf4ff',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  minnaQuizBtnText: { color: '#7c3aed', fontSize: 12, fontWeight: '700' },

  // Grand Quiz Card
  grandQuizCard: {
    backgroundColor: '#f5f3ff',
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#ddd6fe',
  },
  grandQuizHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  grandQuizIcon: { fontSize: 26 },
  grandQuizTitle: { fontSize: 14, fontWeight: '800', color: '#5b21b6' },
  grandQuizDesc: { fontSize: 11, color: '#6d28d9', marginTop: 1 },
  grandQuizBtnRow: { gap: 6 },
  grandQuizBtnAll: {
    backgroundColor: '#7c3aed',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  grandQuizBtnAllText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  grandQuizSubRow: { flexDirection: 'row', gap: 8 },
  grandQuizBtnSub: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c4b5fd',
  },
  grandQuizBtnSubText: { color: '#6d28d9', fontSize: 12, fontWeight: '700' },


  // Thematic Word Card
  wordCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  wordMain: { flex: 1 },
  wordTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  wordKanji: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  badgeGroup: { flexDirection: 'row', gap: 6 },
  levelBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  levelBadgeText: { fontSize: 10, fontWeight: '700', color: '#475569' },
  masteryPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  masteryPillText: { fontSize: 10, fontWeight: '700' },
  wordReading: { fontSize: 13, color: '#64748b', marginBottom: 2 },
  wordRomaji: { color: '#2563eb', fontWeight: '600' },
  wordMeaning: { fontSize: 13, fontWeight: '600', color: '#334155' },
  favBtn: { padding: 6, marginLeft: 8 },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  modalCloseText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  catOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  catOptionActive: { backgroundColor: '#eff6ff' },
  catOptionText: { fontSize: 14, color: '#334155', fontWeight: '500' },
  catOptionTextActive: { color: '#2563eb', fontWeight: '700' },
});
