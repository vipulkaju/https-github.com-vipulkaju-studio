'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  getAuth,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newEmail: z.string().email('Invalid email address.').optional().or(z.literal('')),
    newPassword: z.string().min(6, 'New password must be at least 6 characters.').optional().or(z.literal('')),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: 'New passwords do not match.',
      path: ['confirmPassword'],
    }
  ).refine(
    (data) => {
        return data.newEmail || data.newPassword;
    },
    {
        message: 'You must provide either a new email or a new password.',
        path: ['newEmail'],
    }
  );

export function ChangeCredentialsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const auth = getAuth();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      newEmail: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !user.email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User not found. Please log in again.',
      });
      return;
    }
    setIsLoading(true);

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
      await reauthenticateWithCredential(user, credential);

      let changesMade = false;
      // Update email if provided
      if (values.newEmail) {
        await updateEmail(user, values.newEmail);
        changesMade = true;
        toast({
          title: 'Email Updated',
          description: `Your email has been changed to ${values.newEmail}.`,
        });
      }

      // Update password if provided
      if (values.newPassword) {
        await updatePassword(user, values.newPassword);
        changesMade = true;
        toast({
          title: 'Password Updated',
          description: 'Your password has been changed successfully.',
        });
      }
      
      if(changesMade) {
        form.reset();
      }

    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      const errorCode = error instanceof Error && 'code' in error ? (error as { code: string }).code : '';
      if (errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
        errorMessage = 'The current password you entered is incorrect.';
      } else if (errorCode === 'auth/email-already-in-use') {
        errorMessage = 'The new email address is already in use by another account.';
      } else if (errorCode === 'auth/requires-recent-login') {
        errorMessage = 'This action is sensitive and requires recent authentication. Please log in again before retrying.'
      }
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const inputStyles = 'bg-background/80 backdrop-blur-sm';

  return (
    <Card className="bg-card/80 backdrop-blur-lg border-white/10 shadow-xl">
      <CardHeader>
        <CardTitle>Change Credentials</CardTitle>
        <CardDescription>
          Update your login email or password. You must provide your current password to make changes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className={inputStyles} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Email (Optional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="new.email@example.com" {...field} className={inputStyles} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password (Optional)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className={inputStyles} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch('newPassword') && (
                <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className={inputStyles} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Updating...' : 'Save Changes'}
              <Shield className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
