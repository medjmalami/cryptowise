'use client';

import { useChat } from '@/lib/chat-context';
import { ThemeToggle } from './theme-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function ChatHeader() {
  const { currentConversation } = useChat();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-14 px-4 gap-4">
        <div className="flex items-center gap-4 flex-1">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">
              {currentConversation?.title || 'Select a conversation or create a new one'}
            </h2>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
