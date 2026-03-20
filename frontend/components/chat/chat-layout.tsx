'use client';

import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ChatSidebar } from './sidebar';
import { ChatHeader } from './chat-header';

export function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <ChatSidebar />
      <div className="flex flex-col flex-1 w-full">
        <ChatHeader />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
