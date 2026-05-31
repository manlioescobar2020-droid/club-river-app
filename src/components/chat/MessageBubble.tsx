import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Message } from '../../types/chat';
import { colors, radius, typography } from '../../theme';

function formatTimestamp(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)   return 'Ahora';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Ionicons name="star-outline" size={14} color={colors.red} />
        </View>
      )}

      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={styles.content}>{message.content}</Text>
        <Text style={[styles.time, { textAlign: isUser ? 'right' : 'left' }]}>
          {formatTimestamp(message.timestamp)}
        </Text>
      </View>

      {isUser && (
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={14} color={colors.muted} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  rowUser:      { justifyContent: 'flex-end' },
  rowAssistant: { justifyContent: 'flex-start' },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.redDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    flexShrink: 0,
  },

  bubble: {
    maxWidth: '75%',
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: colors.surface2,
    borderBottomRightRadius: radius.sm,
  },
  bubbleAssistant: {
    backgroundColor: colors.redDim,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderBottomLeftRadius: radius.sm,
  },

  content: {
    ...typography.body,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  time: {
    ...typography.body,
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
});
