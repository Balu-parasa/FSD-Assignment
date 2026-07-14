'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const startEdit = (project: Project) => {
    setEditingId(project._id);
    setEditName(project.name);
    setEditDescription(project.description);
  };

  const saveEdit = async (id: string) => {
    if (editName.trim().length < 2) {
      alert('Project name must be at least 2 characters.');
      return;
    }
    try {
      await api(`/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editName, description: editDescription }),
      });
      setEditingId(null);
      await client.invalidateQueries({ queryKey: ['projects'] });
    } catch {
      alert('Unable to save changes');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api(`/projects/${id}`, { method: 'DELETE' });
      await client.invalidateQueries({ queryKey: ['projects'] });
    } catch {
      alert('Unable to delete project');
    }
  };

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
          <Card key={project._id} className="p-5 flex flex-col justify-between">
            {editingId === project._id ? (
              <div className="space-y-3 w-full">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Project name"
                />
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description"
                />
                <div className="flex gap-2">
                  <Button onClick={() => saveEdit(project._id)}>Save</Button>
                  <Button variant="ghost" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                      {project.key}
                    </span>
                    <h2 className="font-semibold">{project.name}</h2>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(project)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(project._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  {project.description || 'No description yet.'}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
