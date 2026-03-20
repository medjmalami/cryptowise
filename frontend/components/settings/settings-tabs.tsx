'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from './profile-settings';
import { AppearanceSettings } from './appearance-settings';
import { DangerZoneSettings } from './danger-zone-settings';
import { User, Palette, AlertTriangle } from 'lucide-react';

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="profile" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </TabsTrigger>
        <TabsTrigger value="appearance" className="gap-2">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Appearance</span>
        </TabsTrigger>
        <TabsTrigger value="danger" className="gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="hidden sm:inline">Danger</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6">
        <ProfileSettings />
      </TabsContent>

      <TabsContent value="appearance" className="mt-6">
        <AppearanceSettings />
      </TabsContent>

      <TabsContent value="danger" className="mt-6">
        <DangerZoneSettings />
      </TabsContent>
    </Tabs>
  );
}
