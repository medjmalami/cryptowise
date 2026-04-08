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
  const { currentConversation, sendMessage, createConversation, isLoadingMessage } = useChat();
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

  const handleSendMessage = async (message: string) => {
    if (!currentConversation) {
      createConversation();
      // Wait a bit for conversation to be created
      setTimeout(() => handleSendMessage(message), 100);
      return;
    }

    try {
      await sendMessage(message);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    }
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

        <ChatInput onSubmit={handleSendMessage} disabled={isLoadingMessage} />
      </div>
    </ChatLayout>
  );
}
