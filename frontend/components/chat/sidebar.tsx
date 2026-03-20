'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useChat } from '@/lib/chat-context';
import { Button } from '@/components/ui/button';
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Trash2, MoreHorizontal } from 'lucide-react';
import { UserMenu } from './user-menu';

export function ChatSidebar() {
  const { conversations, currentConversation, createConversation, deleteConversation, selectConversation } =
    useChat();

  return (
    <UISidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between px-2 py-3">
          <h1 className="text-lg font-bold text-sidebar-foreground">AI Chat</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              onClick={createConversation}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-4" />

        <div className="space-y-2">
          <p className="px-2 text-xs font-semibold text-sidebar-foreground/60 uppercase">
            Conversations
          </p>
          <SidebarMenu>
            {conversations.length === 0 ? (
              <div className="px-2 py-4 text-xs text-sidebar-foreground/50 text-center">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => (
                <SidebarMenuItem key={conversation.id}>
                  <div className="flex items-center gap-1 group">
                    <SidebarMenuButton
                      onClick={() => selectConversation(conversation.id)}
                      isActive={currentConversation?.id === conversation.id}
                      className="flex-1"
                    >
                      <span className="truncate text-sm">{conversation.title}</span>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => deleteConversation(conversation.id)}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </UISidebar>
  );
}
