'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/services/api';
const credentials = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters'),
});
type Credentials = z.infer<typeof credentials>;
export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const { signIn } = useAuth();
  const schema =
    mode === 'register'
      ? credentials.extend({ name: z.string().min(2, 'Enter your name') })
      : credentials;
  const form = useForm<Credentials & { name?: string }>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', name: '' },
  });
  const submit = async (values: Credentials & { name?: string }) => {
    try {
      if (mode === 'register')
        await api('/auth/register', { method: 'POST', body: JSON.stringify(values) });
      await signIn(values.email, values.password);
      router.push('/dashboard');
    } catch (error) {
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  };
  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
      {mode === 'register' && (
        <label className="block text-sm font-medium">
          Name
          <Input className="mt-1" {...form.register('name')} />
          {form.formState.errors.name && (
            <span className="text-xs text-red-600">{form.formState.errors.name.message}</span>
          )}
        </label>
      )}
      <label className="block text-sm font-medium">
        Email
        <Input className="mt-1" type="email" autoComplete="email" {...form.register('email')} />
        {form.formState.errors.email && (
          <span className="text-xs text-red-600">{form.formState.errors.email.message}</span>
        )}
      </label>
      <label className="block text-sm font-medium">
        Password
        <Input
          className="mt-1"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          {...form.register('password')}
        />
        {form.formState.errors.password && (
          <span className="text-xs text-red-600">{form.formState.errors.password.message}</span>
        )}
      </label>
      {form.formState.errors.root && (
        <p className="text-sm text-red-600">{form.formState.errors.root.message}</p>
      )}
      <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting
          ? 'Please wait…'
          : mode === 'login'
            ? 'Sign in'
            : 'Create account'}
      </Button>
      {mode === 'login' && (
        <Link className="block text-center text-sm text-primary" href="/forgot-password">
          Forgot your password?
        </Link>
      )}
    </form>
  );
}
