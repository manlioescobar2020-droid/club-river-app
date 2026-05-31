import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radius, typography } from '../../theme';

interface Props {
  title: string;
  description: string;
  icon: string;
  price?: string;
  selected?: boolean;
  onPress: () => void;
}

export default function OptionCard({
  title,
  description,
  icon,
  price,
  selected = false,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
        <Ionicons
          name={icon as any}
          size={28}
          color={selected ? colors.red : colors.muted}
        />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, selected && styles.titleSelected]}>
          {title}
        </Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {price && (
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>desde</Text>
          <Text style={[styles.price, selected && styles.priceSelected]}>
            {price}
          </Text>
        </View>
      )}

      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection:  'row',
    alignItems:     'center',
    backgroundColor: colors.surface,
    borderRadius:   radius.md,
    padding:        16,
    marginBottom:   12,
    borderWidth:    1,
    borderColor:    colors.glassBorder,
  },
  cardSelected: {
    borderColor:     colors.red,
    backgroundColor: colors.redDim,
  },
  iconContainer: {
    width:           52,
    height:          52,
    borderRadius:    26,
    backgroundColor: colors.surface2,
    justifyContent:  'center',
    alignItems:      'center',
    marginRight:     12,
  },
  iconContainerSelected: {
    backgroundColor: colors.redDim,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.bodySemiBold,
    fontSize:     16,
    color:        colors.text,
    marginBottom: 4,
  },
  titleSelected: {
    color: colors.red,
  },
  description: {
    ...typography.body,
    fontSize:   13,
    color:      colors.muted,
    lineHeight: 18,
  },
  priceContainer: {
    marginRight:  12,
    alignItems:   'flex-end',
  },
  priceLabel: {
    ...typography.body,
    fontSize: 11,
    color:    colors.muted,
  },
  price: {
    ...typography.bodyBold,
    fontSize: 16,
    color:    colors.text,
  },
  priceSelected: {
    color: colors.red,
  },
  radio: {
    width:        24,
    height:       24,
    borderRadius: 12,
    borderWidth:  2,
    borderColor:  colors.glassBorder,
    justifyContent: 'center',
    alignItems:     'center',
  },
  radioSelected: {
    borderColor: colors.red,
  },
  radioDot: {
    width:           12,
    height:          12,
    borderRadius:    6,
    backgroundColor: colors.red,
  },
});
