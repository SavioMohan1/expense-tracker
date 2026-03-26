import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Category } from '../../types';

interface Props {
  category: Category;
  size?: number;
}

export default function CategoryIcon({ category, size = 40 }: Props) {
  const iconSize = size * 0.55;
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: category.color + '25' }]}>
      <MaterialCommunityIcons
        name={category.icon as any}
        size={iconSize}
        color={category.color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
