'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
      <div className="flex gap-2 max-w-4xl mx-auto">
        <Input
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
