import type { Request, Response } from 'express';
import { TaskModel } from '../models/task.js';
import { ProjectModel } from '../models/project.js';
import { taskSchema } from '../validators/schemas.js';
import { respond } from '../utils/api.js';
import { recordActivity } from '../services/activity-service.js';
import { notify } from '../services/notification-service.js';
const availableProject = (projectId: string, userId: string) =>
  ProjectModel.exists({ _id: projectId, $or: [{ owner: userId }, { members: userId }] });
export const listTasks = async (req: Request, res: Response) => {
  const projectId = String(req.params.projectId);
  if (!(await availableProject(projectId, req.user!.id)))
    return respond(res, 404, 'Project not found');
  const { status, assignee } = req.query;
  const filter: Record<string, unknown> = { project: projectId };
  if (typeof status === 'string') filter.status = status;
  if (typeof assignee === 'string') filter.assignee = assignee;
  return respond(
    res,
    200,
    'Tasks retrieved',
    await TaskModel.find(filter)
      .populate('assignee createdBy', 'name email avatarUrl')
      .sort({ updatedAt: -1 }),
  );
};
export const createTask = async (req: Request, res: Response) => {
  const projectId = String(req.params.projectId);
  if (!(await availableProject(projectId, req.user!.id)))
    return respond(res, 404, 'Project not found');
  const values = taskSchema.parse(req.body);
  const task = await TaskModel.create({ ...values, project: projectId, createdBy: req.user!.id });
  await recordActivity(req.user!.id, 'task.created', { project: projectId, task: task.id });
  if (task.assignee && task.assignee.toString() !== req.user!.id)
    await notify(
      task.assignee.toString(),
      'assignment',
      `You were assigned “${task.title}”`,
      `/tasks/${task.id}`,
    );
  return respond(res, 201, 'Task created', task);
};
export const getTask = async (req: Request, res: Response) => {
  const task = await TaskModel.findById(req.params.taskId).populate(
    'assignee createdBy',
    'name email avatarUrl',
  );
  return task ? respond(res, 200, 'Task retrieved', task) : respond(res, 404, 'Task not found');
};
export const updateTask = async (req: Request, res: Response) => {
  const values = taskSchema.partial().parse(req.body);
  const task = await TaskModel.findByIdAndUpdate(req.params.taskId, values, {
    new: true,
    runValidators: true,
  });
  if (!task) return respond(res, 404, 'Task not found');
  await recordActivity(req.user!.id, 'task.updated', {
    project: task.project.toString(),
    task: task.id,
    metadata: { fields: Object.keys(values) },
  });
  if (typeof values.assignee === 'string' && values.assignee !== req.user!.id)
    await notify(
      values.assignee,
      'assignment',
      `You were assigned “${task.title}”`,
      `/tasks/${task.id}`,
    );
  return respond(res, 200, 'Task updated', task);
};
export const deleteTask = async (req: Request, res: Response) => {
  const task = await TaskModel.findByIdAndDelete(req.params.taskId);
  if (task)
    await recordActivity(req.user!.id, 'task.deleted', {
      project: task.project.toString(),
      task: task.id,
    });
  return task ? respond(res, 200, 'Task deleted') : respond(res, 404, 'Task not found');
};
