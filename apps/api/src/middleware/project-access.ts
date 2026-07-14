import type { NextFunction, Request, Response } from 'express';
import { ProjectModel } from '../models/project.js';
import { TaskModel } from '../models/task.js';
import { CommentModel } from '../models/comment.js';
import { respond } from '../utils/api.js';

const canAccessProject = async (projectId: string, userId: string, role: unknown) => {
  if (role === 'admin') return ProjectModel.exists({ _id: projectId });
  return ProjectModel.exists({ _id: projectId, $or: [{ owner: userId }, { members: userId }] });
};

export const requireProjectAccess = async (req: Request, res: Response, next: NextFunction) => {
  const permitted = await canAccessProject(
    String(req.params.projectId),
    req.user!.id,
    req.user!.role,
  );
  return permitted ? next() : respond(res, 404, 'Project not found');
};

export const requireTaskAccess = async (req: Request, res: Response, next: NextFunction) => {
  const task = await TaskModel.findById(req.params.taskId).select('project');
  if (!task) return respond(res, 404, 'Task not found');
  const permitted = await canAccessProject(task.project.toString(), req.user!.id, req.user!.role);
  return permitted ? next() : respond(res, 404, 'Task not found');
};

export const requireCommentAccess = async (req: Request, res: Response, next: NextFunction) => {
  const comment = await CommentModel.findById(req.params.commentId).select('task');
  if (!comment) return respond(res, 404, 'Comment not found');
  const task = await TaskModel.findById(comment.task).select('project');
  if (!task) return respond(res, 404, 'Comment not found');
  const permitted = await canAccessProject(task.project.toString(), req.user!.id, req.user!.role);
  return permitted ? next() : respond(res, 404, 'Comment not found');
};
