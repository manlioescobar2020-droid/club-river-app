import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useChatContext } from '../../context/ChatContext';
import MessageBubble from './MessageBubble';
import { colors, radius, typography } from '../../theme';

export default function ChatModal() {
  const { messages, isOpen, isLoading, closeChat, sendMessage, clearHistory } = useChatContext();
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    sendMessage(trimmed);
  }

  function scrollToBottom() {
    if (messages.length > 0) listRef.current?.scrollToEnd({ animated: true });
  }

  const canSend = !!input.trim() && !isLoading;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeChat}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="star-outline" size={18} color={colors.red} />
            <Text style={styles.headerTitle}>ASISTENTE</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity testID="chat-clear-btn" onPress={clearHistory} style={styles.headerBtn} disabled={isLoading}>
              <Ionicons name="trash-outline" size={20} color={colors.muted} />
            </TouchableOpacity>
            <TouchableOpacity testID="chat-close-btn" onPress={closeChat} style={styles.headerBtn}>
              <Ionicons name="close-outline" size={24} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={scrollToBottom}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="star-outline" size={40} color={colors.muted} />
                <Text style={styles.emptyText}>
                  {'Hola! Soy el asistente de Club River.\nPreguntame sobre disciplinas, categorías o información del club.'}
                </Text>
              </View>
            }
          />

          {isLoading && (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color={colors.muted} />
              <Text style={styles.typingText}>Escribiendo...</Text>
            </View>
          )}

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              testID="chat-input"
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Escribí tu pregunta..."
              placeholderTextColor={colors.muted}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              editable={!isLoading}
            />
            <TouchableOpacity
              testID="chat-send-btn"
              style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!canSend}
            >
              <Ionicons
                name="send-outline"
                size={18}
                color={canSend ? colors.text : colors.muted}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: {
    ...typography.display,
    fontSize: 18,
    color: colors.text,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerBtn: { padding: 6, marginLeft: 4 },

  listContent: { paddingVertical: 12, flexGrow: 1 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    gap: 16,
  },
  emptyText: {
    ...typography.body,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },

  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  typingText: {
    ...typography.body,
    fontSize: 13,
    color: colors.muted,
    fontStyle: 'italic',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderRadius: radius.lg,
    borderColor: colors.glassBorder,
    backgroundColor: colors.surface2,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...typography.body,
    fontSize: 15,
    color: colors.text,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: colors.surface2,
  },
});
