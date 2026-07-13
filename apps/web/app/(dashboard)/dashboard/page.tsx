'use client';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, CheckCircle2, FolderKanban, ListTodo } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { api } from '@/services/api';
import type { Project, Task } from '@/types';
type Dashboard = {
  statistics: { projects: number; assignedTasks: number; completedTasks: number };
  projects: Project[];
  assignedTasks: Task[];
  activity: Array<{ _id: string; action: string; createdAt: string; actor?: { name: string } }>;
};
export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api<Dashboard>('/dashboard'),
    staleTime: Infinity,
  });
  if (isLoading) return <p className="text-sm text-slate-500">Loading your work…</p>;
  const stats = [
    { label: 'Active projects', value: data?.statistics.projects ?? 0, icon: FolderKanban },
    { label: 'Assigned to you', value: data?.statistics.assignedTasks ?? 0, icon: ListTodo },
    { label: 'Completed work', value: data?.statistics.completedTasks ?? 0, icon: CheckCircle2 },
  ];
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">Your workspace</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Fix. Improve. Ship.</h1>
        <p className="mt-2 text-slate-500">Keep every project and delivery moving forward.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5">
            <Icon className="mb-5 text-primary" size={20} />
            <p className="text-3xl font-semibold">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </Card>
        ))}
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">My projects</h2>
            <Link className="text-sm text-primary" href="/projects">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {data?.projects.map((project) => (
              <Link
                key={project._id}
                href={`/projects/${project._id}`}
                className="flex items-center justify-between rounded-lg p-3 hover:bg-muted"
              >
                <span>
                  <b>{project.key}</b>
                  <span className="ml-3 text-sm text-slate-500">{project.name}</span>
                </span>
                <ArrowUpRight size={16} />
              </Link>
            )) ?? (
              <p className="text-sm text-slate-500">Create your first project to get started.</p>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Assigned tasks</h2>
          <div className="space-y-2">
            {data?.assignedTasks.map((task) => (
              <div key={task._id} className="rounded-lg bg-muted p-3">
                <p className="font-medium">{task.title}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  {task.status.replace('_', ' ')} · {task.priority}
                </p>
              </div>
            )) ?? <p className="text-sm text-slate-500">Nothing assigned to you right now.</p>}
          </div>
        </Card>
      </section>
    </div>
  );
}
