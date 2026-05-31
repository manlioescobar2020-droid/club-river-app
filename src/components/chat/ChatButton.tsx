import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useChatContext } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { colors, radius } from '../../theme';

export default function ChatButton() {
  const { openChat } = useChatContext();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <TouchableOpacity testID="chat-open-btn" style={styles.button} onPress={openChat} activeOpacity={0.85}>
      <Ionicons name="chatbubble-ellipses-outline" size={26} color={colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
