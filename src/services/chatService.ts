import api from './api';
import { ChatRequest, ChatResponse } from '../types/chat';

export const chatService = {
  async enviarMensaje(request: ChatRequest): Promise<ChatResponse> {
    // 30s timeout — AI responses can be slow
    const response = await api.post('/assistant/chat', request, { timeout: 30000 });
    return response.data;
  },
};
