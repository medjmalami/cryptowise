'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: 'light',
      label: 'Light',
      description: 'Bright and clean',
      icon: Sun,
    },
    {
      id: 'dark',
      label: 'Dark',
      description: 'Easy on the eyes',
      icon: Moon,
    },
    {
      id: 'system',
      label: 'System',
      description: 'Match device settings',
      icon: Monitor,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize how the app looks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.id;

            return (
              <Button
                key={t.id}
                variant={isActive ? 'default' : 'outline'}
                className="h-auto flex flex-col items-center gap-2 p-4"
                onClick={() => setTheme(t.id)}
              >
                <Icon className="h-6 w-6" />
                <span className="font-medium text-sm">{t.label}</span>
                <span className="text-xs text-muted-foreground">{t.description}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
