'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { updateProfileSchema, UpdateProfileInput } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  async function onSubmit(data: UpdateProfileInput) {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateProfile(data.name, data.email);
      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Manage your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Avatar</p>
            <p className="text-xs text-muted-foreground mt-1">
              Powered by Dicebear Avatars
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
