'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';
import type { Project } from '@/types';
const schema = z.object({
  name: z.string().min(2),
  key: z.string().regex(/^[A-Za-z][A-Za-z0-9]{1,9}$/),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;
export default function ProjectsPage() {
  const client = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api<Project[]>('/projects'),
  });
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const create = async (values: FormValues) => {
    const optimisticProject = {
      _id: crypto.randomUUID(),
      ...values,
      description: values.description ?? '',
      updatedAt: new Date().toISOString(),
    };
    client.setQueryData<Project[]>(['projects'], (projects = []) => [
      optimisticProject,
      ...projects,
    ]);
    try {
      await api('/projects', { method: 'POST', body: JSON.stringify(values) });
      form.reset();
      await client.invalidateQueries({ queryKey: ['projects'] });
    } catch {
      form.setError('root', { message: 'Unable to create project' });
    }
  };
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">Plan the work</p>
        <h1 className="mt-1 text-3xl font-semibold">Projects</h1>
      </div>
      <Card className="p-5">
        <h2 className="mb-4 font-semibold">Create project</h2>
        <form className="grid gap-3 md:grid-cols-4" onSubmit={form.handleSubmit(create)}>
          <Input placeholder="Project name" {...form.register('name')} />
          <Input placeholder="Key (e.g. WEB)" {...form.register('key')} />
          <Input placeholder="Description (optional)" {...form.register('description')} />
          <Button>Create project</Button>
          {form.formState.errors.root && (
            <p className="text-sm text-red-600">{form.formState.errors.root.message}</p>
          )}
        </form>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {data.map((project) => (
          <Card key={project._id} className="p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                {project.key}
              </span>
              <h2 className="font-semibold">{project.name}</h2>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {project.description || 'No description yet.'}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
