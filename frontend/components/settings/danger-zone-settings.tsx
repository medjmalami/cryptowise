'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useChat } from '@/lib/chat-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

export function DangerZoneSettings() {
  const { deleteAccount } = useAuth();
  const { clearAllConversations } = useChat();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearConversations = async () => {
    setIsClearing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      clearAllConversations();
      toast({
        title: 'Success',
        description: 'All conversations have been cleared.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear conversations.',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      deleteAccount();
      toast({
        title: 'Success',
        description: 'Your account has been deleted.',
      });
      router.push('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete your account.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>Irreversible actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 pb-4 border-b border-destructive/10">
          <div>
            <p className="font-medium text-sm">Clear all conversations</p>
            <p className="text-xs text-muted-foreground">
              Permanently delete all your chat conversations. This action cannot be undone.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear conversations
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all conversations?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your chat conversations. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearConversations}
                  disabled={isClearing}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isClearing ? 'Clearing...' : 'Clear all'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="space-y-3">
          <div>
            <p className="font-medium text-sm">Delete account</p>
            <p className="text-xs text-muted-foreground">
              Permanently delete your account and all associated data. This action cannot be
              undone.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account and all associated data. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDeleting ? 'Deleting...' : 'Delete account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
