export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Matches the actual backend /api/assistant/chat contract
export interface ChatRequest {
  mensaje: string;
  conversacionId?: number;
}

export interface ChatResponse {
  respuesta: string;
  conversacionId: number;
  mensajeId: number;
}
