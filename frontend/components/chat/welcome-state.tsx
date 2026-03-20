'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Explain quantum computing in simple terms',
  'Write a Python function to sort an array',
  'What are the benefits of machine learning?',
  'How do I start learning web development?',
  'Explain the concept of blockchain',
  'Give me tips for better productivity',
];

interface WelcomeStateProps {
  onPromptSelect: (prompt: string) => void;
}

export function WelcomeState({ onPromptSelect }: WelcomeStateProps) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-full gap-8 px-4 py-12">
      <div className="text-center space-y-3 max-w-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-balance">
          Hello, <span className="text-primary">{user?.name.split(' ')[0]}</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Start a conversation with your AI assistant. Ask anything and get helpful responses.
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <p className="text-sm font-semibold text-muted-foreground mb-3 text-center">
          Try asking about
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SUGGESTED_PROMPTS.map((prompt, index) => (
            <Button
              key={index}
              onClick={() => onPromptSelect(prompt)}
              variant="outline"
              className="h-auto p-4 justify-start text-left hover:bg-primary/5 hover:border-primary/50"
            >
              <span className="text-sm text-foreground">{prompt}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
