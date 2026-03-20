'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/lib/validators';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: ForgotPasswordInput) {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSubmittedEmail(data.email);
      setSubmitted(true);

      toast({
        title: 'Success',
        description: 'Password reset link has been sent to your email.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process your request. Please try again.',
        variant: 'destructive',
      });
    }
  }

  if (submitted) {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="text-muted-foreground">
            We've sent a password reset link to{' '}
            <span className="font-medium text-foreground">{submittedEmail}</span>
          </p>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm text-muted-foreground">
          <p>Check your spam folder if you don&apos;t see the email in the next few minutes.</p>
        </div>

        <Button
          onClick={() => {
            setSubmitted(false);
            form.reset();
          }}
          variant="outline"
          className="w-full"
        >
          Send another link
        </Button>

        <Link href="/login" className="flex items-center justify-center text-sm text-primary hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full max-w-sm">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Reset password</h2>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Send reset link
        </Button>

        <Link href="/login" className="flex items-center justify-center text-sm text-primary hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Link>
      </form>
    </Form>
  );
}
