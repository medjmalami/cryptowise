'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ChatLayout } from '@/components/chat/chat-layout';
import { SettingsTabs } from '@/components/settings/settings-tabs';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <ChatLayout>
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-2">
                Manage your account and preferences
              </p>
            </div>

            <SettingsTabs />
          </div>
        </div>
      </div>
    </ChatLayout>
  );
}
