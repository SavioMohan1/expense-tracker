import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, TextInput, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TransactionItem from '../components/transactions/TransactionItem';
import EmptyState from '../components/common/EmptyState';
import { useAppContext } from '../context/AppContext';
import { useFilteredTransactions } from '../hooks/useTransactions';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { categories, settings, removeTransaction } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useFilteredTransactions(searchQuery, selectedCategory, startDate, endDate);

  const clearFilters = useCallback(() => {
    setSelectedCategory(null);
    setStartDate(null);
    setEndDate(null);
    setSearchQuery('');
  }, []);

  const hasFilters = !!selectedCategory || !!startDate || !!endDate || !!searchQuery;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <View style={styles.headerActions}>
          {hasFilters && (
            <TouchableOpacity onPress={clearFilters} style={styles.clearBtn}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowFilters((v) => !v)} style={styles.filterBtn}>
            <MaterialCommunityIcons
              name="filter-variant"
              size={22}
              color={showFilters ? COLORS.primary : COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search transactions..."
          style={styles.searchInput}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          placeholderTextColor={COLORS.textTertiary}
          textColor={COLORS.text}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Filter by category</Text>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChips}
            renderItem={({ item }) => (
              <Chip
                selected={selectedCategory === item.id}
                onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
                style={[
                  styles.chip,
                  selectedCategory === item.id && { backgroundColor: item.color + '30' },
                ]}
                textStyle={[
                  styles.chipText,
                  selectedCategory === item.id && { color: item.color },
                ]}
              >
                {item.label}
              </Chip>
            )}
          />
          <View style={styles.dateRow}>
            <TextInput
              value={startDate ?? ''}
              onChangeText={(v) => setStartDate(v || null)}
              label="From (YYYY-MM-DD)"
              mode="outlined"
              style={styles.dateInput}
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
              dense
            />
            <TextInput
              value={endDate ?? ''}
              onChangeText={(v) => setEndDate(v || null)}
              label="To (YYYY-MM-DD)"
              mode="outlined"
              style={styles.dateInput}
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
              dense
            />
          </View>
        </View>
      )}

      <View style={styles.countRow}>
        <Text style={styles.countText}>{filtered.length} transactions</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            category={categories.find((c) => c.id === item.category_id)}
            currency={settings.currency}
            onDelete={removeTransaction}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title={hasFilters ? 'No matching transactions' : 'No transactions yet'}
            subtitle={hasFilters ? 'Try adjusting your filters' : 'Add your first expense using the + button'}
          />
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContent : styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  clearBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.danger + '15',
  },
  clearText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.danger,
    fontWeight: '600',
  },
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: FONT_SIZE.md,
    height: 44,
  },
  filtersContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryChips: {
    gap: SPACING.xs,
    paddingVertical: 2,
  },
  chip: {
    borderRadius: BORDER_RADIUS.full,
  },
  chipText: {
    fontSize: FONT_SIZE.xs,
  },
  dateRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dateInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    fontSize: FONT_SIZE.sm,
  },
  countRow: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  countText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  emptyContent: {
    flex: 1,
  },
});
