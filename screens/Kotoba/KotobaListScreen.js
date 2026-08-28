import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Modal, ScrollView,
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

export default function KotobaListScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all' | 'N5' | 'N4'
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [masteryFilter, setMasteryFilter] = useState('all'); // 'all' | 'unlearned' | 'learning' | 'mastered'

  const [masteryData, setMasteryData] = useState({});
  const [favoritesMap, setFavoritesMap] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const categories = useMemo(() => getKotobaCategories(), []);

  const refreshUserData = async () => {
    const mData = await getNamespaceData('kotoba');
    const fData = await getFavoritesList();
    setMasteryData(mData || {});
    setFavoritesMap(fData || {});
  };

  useEffect(() => {
    if (isFocused) {
      refreshUserData();
    }
  }, [isFocused]);

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

  // Overall stats
  const stats = useMemo(() => {
    let mastered = 0;
    let learning = 0;
    let unlearned = 0;
    ALL_KOTOBA.forEach((w) => {
      const stats = masteryData[w.id];
      const level = calculateMastery(stats);
      if (level === 'mastered') mastered++;
      else if (level === 'learning') learning++;
      else unlearned++;
    });
    const total = ALL_KOTOBA.length;
    const percent = Math.round((mastered / total) * 100);
    return { mastered, learning, unlearned, total, percent };
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

  const startFlashcard = (mode = 'all') => {
    navigation.navigate('KotobaFlashcard', {
      category: selectedCategory,
      level: selectedLevel,
      mode,
    });
  };

  const renderWordItem = ({ item }) => {
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
          hitSlop={10}
        >
          <Text style={{ fontSize: 20 }}>{isFav ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>1000 Kosakata (Kotoba)</Text>
        <TouchableOpacity
          style={styles.flashcardQuickBtn}
          onPress={() => startFlashcard('all')}
          activeOpacity={0.8}
        >
          <Text style={styles.flashcardQuickText}>🎴 Flashcard</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Snapshot */}
      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <Text style={styles.progressHeading}>Penguasaan Kosakata</Text>
          <Text style={styles.progressPercent}>{stats.percent}% ({stats.mastered}/{stats.total})</Text>
        </View>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${stats.percent}%` }]} />
        </View>
        <View style={styles.statTags}>
          <Text style={styles.statTagText}>🟢 {stats.mastered} Mahir</Text>
          <Text style={styles.statTagText}>🟡 {stats.learning} Belajar</Text>
          <Text style={styles.statTagText}>⚪ {stats.unlearned} Belum</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari kanji, reading, romaji, arti..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter Row */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterChip, selectedCategory !== 'all' && styles.filterChipActive]}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={[styles.filterChipText, selectedCategory !== 'all' && styles.filterChipTextActive]}>
            {selectedCategory === 'all' ? '📁 Semua Kategori' : categories.find(c => c.id === selectedCategory)?.labelID || 'Kategori'}
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

      {/* Word Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>Menampilkan {filteredWords.length} kata</Text>
      </View>

      {/* List */}
      <FlatList
        data={filteredWords}
        keyExtractor={(item) => item.id}
        renderItem={renderWordItem}
        contentContainerStyle={styles.listContent}
        initialNumToRender={20}
        maxToRenderPerBatch={25}
        windowSize={10}
        showsVerticalScrollIndicator={false}
      />

      {/* Category Modal */}
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
                <Text style={styles.catOptionText}>🌐 Semua Kategori (1000 Kata)</Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catOption, selectedCategory === cat.id && styles.catOptionActive]}
                  onPress={() => {
                    setSelectedCategory(cat.id);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.catOptionText}>
                    {cat.icon} {cat.labelID} ({cat.labelJP})
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  flashcardQuickBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  flashcardQuickText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  progressCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressHeading: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  progressPercent: { fontSize: 14, fontWeight: '800', color: '#16a34a' },
  barBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  barFill: { height: '100%', backgroundColor: '#16a34a' },
  statTags: { flexDirection: 'row', justifyContent: 'space-between' },
  statTagText: { fontSize: 12, color: '#64748b', fontWeight: '600' },

  searchContainer: { paddingHorizontal: 16, marginBottom: 8 },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },

  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  filterChip: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  filterChipSmall: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  filterChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  filterChipTextActive: { color: '#2563eb', fontWeight: '700' },

  countRow: { paddingHorizontal: 16, paddingBottom: 6 },
  countText: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },

  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  wordCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  wordMain: { flex: 1, marginRight: 8 },
  wordTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  wordKanji: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  badgeGroup: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  levelBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelBadgeText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  masteryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  masteryPillText: { fontSize: 11, fontWeight: '700' },
  wordReading: { fontSize: 13, color: '#2563eb', fontWeight: '600', marginBottom: 2 },
  wordRomaji: { fontSize: 13, color: '#64748b', fontWeight: '400' },
  wordMeaning: { fontSize: 14, color: '#334155', fontWeight: '500' },
  favBtn: { padding: 4 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  modalCloseText: { color: '#ef4444', fontWeight: '700', fontSize: 14 },
  catOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  catOptionActive: { backgroundColor: '#eff6ff' },
  catOptionText: { fontSize: 14, color: '#1e293b', fontWeight: '600' },
});
