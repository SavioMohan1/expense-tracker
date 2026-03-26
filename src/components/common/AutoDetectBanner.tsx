import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAppContext } from '../../context/AppContext';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZE } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

export default function AutoDetectBanner() {
  const { detectedExpense, setDetectedExpense } = useAppContext();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (detectedExpense) {
      translateY.value = withSpring(0);
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(-100);
      opacity.value = withTiming(0);
    }
  }, [detectedExpense]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!detectedExpense) return null;

  const handleAccept = () => {
    navigation.navigate('AddExpenseModal', {
      prefillAmount: detectedExpense.amount,
      prefillMerchant: detectedExpense.merchant,
    });
    setDetectedExpense(null);
  };

  const handleDismiss = () => setDetectedExpense(null);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="bell-ring" size={20} color={COLORS.primary} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Payment Detected</Text>
          <Text style={styles.subtitle}>
            {detectedExpense.merchant
              ? `${detectedExpense.amount.toFixed(2)} at ${detectedExpense.merchant}`
              : `Amount: ${detectedExpense.amount.toFixed(2)}`}
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAccept}>
          <Text style={styles.addText}>Log it</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
          <MaterialCommunityIcons name="close" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    padding: SPACING.sm,
  },
  content: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  addText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  closeBtn: {
    padding: SPACING.xs,
  },
});
