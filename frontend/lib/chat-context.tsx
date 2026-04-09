'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import * as chatService from './api/chat.service';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoadingMessage: boolean;
  createConversation: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  sendMessage: (content: string) => Promise<void>;
  renameConversation: (id: string, title: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('conversations');
      if (!stored) return [];

      try {
        const parsed = JSON.parse(stored) as Array<{
          id: string;
          title: string;
          messages: Array<{
            id: string;
            content: string;
            role: 'user' | 'assistant';
            timestamp: string | number | Date;
          }>;
          createdAt: string | number | Date;
          updatedAt: string | number | Date;
        }>;

        return parsed.map((conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) => ({
            ...message,
            timestamp: new Date(message.timestamp),
          })),
          createdAt: new Date(conversation.createdAt),
          updatedAt: new Date(conversation.updatedAt),
        }));
      } catch {
        localStorage.removeItem('conversations');
        return [];
      }
    }
    return [];
  });

  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(
    conversations.length > 0 ? conversations[0] : null
  );

  const [isLoadingMessage, setIsLoadingMessage] = useState(false);

  const createConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: `Conversation ${conversations.length + 1}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations((prev) => {
      const updated = [newConversation, ...prev];
      localStorage.setItem('conversations', JSON.stringify(updated));
      return updated;
    });

    setCurrentConversation(newConversation);
  }, [conversations.length]);

  const selectConversation = useCallback((id: string) => {
    const conversation = conversations.find((c) => c.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  }, [conversations]);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      localStorage.setItem('conversations', JSON.stringify(updated));
      return updated;
    });

    if (currentConversation?.id === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setCurrentConversation(remaining.length > 0 ? remaining[0] : null);
    }
  }, [conversations, currentConversation]);

  const clearAllConversations = useCallback(() => {
    setConversations([]);
    setCurrentConversation(null);
    localStorage.setItem('conversations', JSON.stringify([]));
  }, []);

  const addMessage = useCallback((content: string, role: 'user' | 'assistant') => {
    if (!currentConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date(),
    };

    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, newMessage],
      updatedAt: new Date(),
    };

    setConversations((prev) => {
      const updated = prev.map((c) => (c.id === currentConversation.id ? updatedConversation : c));
      localStorage.setItem('conversations', JSON.stringify(updated));
      return updated;
    });

    setCurrentConversation(updatedConversation);
  }, [currentConversation]);

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, title, updatedAt: new Date() } : c));
      localStorage.setItem('conversations', JSON.stringify(updated));
      return updated;
    });

    if (currentConversation?.id === id) {
      setCurrentConversation({ ...currentConversation, title });
    }
  }, [currentConversation]);

  // New function: Send message to API and get AI response
  const sendMessage = useCallback(async (content: string) => {
    if (!currentConversation) return;

    // Add user message first
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    let updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage],
      updatedAt: new Date(),
    };

    // Update state with user message
    setConversations((prev) => {
      const updated = prev.map((c) => (c.id === currentConversation.id ? updatedConversation : c));
      localStorage.setItem('conversations', JSON.stringify(updated));
      return updated;
    });
    setCurrentConversation(updatedConversation);

    // Call API for AI response
    setIsLoadingMessage(true);
    try {
      const response = await chatService.sendChatMessage(content);
      const assistantContent = chatService.extractAssistantMessage(response);

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantContent,
        role: 'assistant',
        timestamp: new Date(),
      };

      updatedConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        updatedAt: new Date(),
      };

      setConversations((prev) => {
        const updated = prev.map((c) => (c.id === currentConversation.id ? updatedConversation : c));
        localStorage.setItem('conversations', JSON.stringify(updated));
        return updated;
      });
      setCurrentConversation(updatedConversation);
    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? `Error: ${error.message}` : 'Failed to get response from AI. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };

      updatedConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, errorMessage],
        updatedAt: new Date(),
      };

      setConversations((prev) => {
        const updated = prev.map((c) => (c.id === currentConversation.id ? updatedConversation : c));
        localStorage.setItem('conversations', JSON.stringify(updated));
        return updated;
      });
      setCurrentConversation(updatedConversation);
      
      throw error;
    } finally {
      setIsLoadingMessage(false);
    }
  }, [currentConversation]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        isLoadingMessage,
        createConversation,
        selectConversation,
        deleteConversation,
        clearAllConversations,
        addMessage,
        sendMessage,
        renameConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
