import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import { Alert } from 'react-native';
import { Message, ChatRequest, ChatResponse } from '../types/chat';
import { chatService } from '../services/chatService';

const MAX_DISPLAY = 20;

interface ChatContextType {
  messages: Message[];
  isOpen: boolean;
  isLoading: boolean;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  isOpen: false,
  isLoading: false,
  openChat: () => {},
  closeChat: () => {},
  sendMessage: async () => {},
  clearHistory: () => {},
});

export function useChatContext() {
  return useContext(ChatContext);
}

function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function sendWithRetry(payload: ChatRequest, retries = 1): Promise<ChatResponse> {
  try {
    return await chatService.enviarMensaje(payload);
  } catch (e) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 600));
      return sendWithRetry(payload, retries - 1);
    }
    throw e;
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const conversacionIdRef = useRef<number | undefined>(undefined);

  const openChat  = useCallback(() => setIsOpen(true),  []);
  const closeChat = useCallback(() => setIsOpen(false), []);

  const clearHistory = useCallback(() => {
    conversacionIdRef.current = undefined;
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > 500 || isLoading) return;

    const userMsg: Message = {
      id: makeId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg].slice(-MAX_DISPLAY));
    setIsLoading(true);

    try {
      const payload: ChatRequest = {
        mensaje: trimmed,
        conversacionId: conversacionIdRef.current,
      };

      const data = await sendWithRetry(payload);

      if (data.conversacionId) {
        conversacionIdRef.current = data.conversacionId;
      }

      const assistantMsg: Message = {
        id: makeId(),
        role: 'assistant',
        content: data.respuesta,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg].slice(-MAX_DISPLAY));
    } catch (e: any) {
      const errorMsg = e.message || 'Error de red. Intentá de nuevo.';
      Alert.alert('Error', errorMsg);
      // Remove the user message that failed so the user can retry
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return (
    <ChatContext.Provider value={{ messages, isOpen, isLoading, openChat, closeChat, sendMessage, clearHistory }}>
      {children}
    </ChatContext.Provider>
  );
}
