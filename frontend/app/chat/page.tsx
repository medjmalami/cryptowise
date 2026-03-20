'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useChat } from '@/lib/chat-context';
import { ChatLayout } from '@/components/chat/chat-layout';
import { MessageBubble } from '@/components/chat/message-bubble';
import { WelcomeState } from '@/components/chat/welcome-state';
import { ChatInput } from '@/components/chat/chat-input';
import { useToast } from '@/hooks/use-toast';

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { currentConversation, addMessage, createConversation } = useChat();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (messagesEndRef.current && messageContainerRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConversation?.messages]);

  if (!user) {
    return null;
  }

  const handlePromptSelect = (prompt: string) => {
    if (!currentConversation) {
      createConversation();
      return;
    }
    handleSendMessage(prompt);
  };

  const handleSendMessage = (message: string) => {
    addMessage(message, 'user');

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'That\'s a great question! Let me help you with that.',
        'I can provide you with detailed information about that.',
        'Here\'s what I think about your question...',
        'Based on your question, here are some insights...',
        'That\'s an interesting topic! Let me elaborate...',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addMessage(randomResponse, 'assistant');
    }, 500);
  };

  return (
    <ChatLayout>
      <div className="flex flex-col h-full">
        <div
          ref={messageContainerRef}
          className="flex-1 overflow-auto px-4 py-6 space-y-4 max-w-4xl mx-auto w-full"
        >
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <WelcomeState onPromptSelect={handlePromptSelect} />
          ) : (
            <>
              {currentConversation.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  userAvatar={user.avatar}
                  userName={user.name}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <ChatInput onSubmit={handleSendMessage} />
      </div>
    </ChatLayout>
  );
}
