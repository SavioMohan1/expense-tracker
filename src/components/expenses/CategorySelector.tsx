import React from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { Category } from '../../types';
import CategoryIcon from '../common/CategoryIcon';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';

interface Props {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function CategorySelector({ categories, selectedId, onSelect }: Props) {
  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id}
      numColumns={4}
      scrollEnabled={false}
      renderItem={({ item }) => {
        const isSelected = item.id === selectedId;
        return (
          <TouchableOpacity
            style={[styles.item, isSelected && styles.selectedItem]}
            onPress={() => onSelect(item.id)}
            activeOpacity={0.7}
          >
            <CategoryIcon category={item} size={isSelected ? 46 : 42} />
            <Text style={[styles.label, isSelected && styles.selectedLabel]} numberOfLines={2}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.xs,
    gap: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    margin: 4,
    paddingVertical: SPACING.sm,
  },
  selectedItem: {
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  selectedLabel: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
