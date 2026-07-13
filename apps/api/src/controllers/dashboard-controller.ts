import type { Request, Response } from 'express';
import { ProjectModel } from '../models/project.js';
import { TaskModel } from '../models/task.js';
import { ActivityLogModel } from '../models/activity-log.js';
import { respond } from '../utils/api.js';
export const dashboard = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const allProjectsQuery = {
    $or: [{ owner: userId }, { members: userId }],
    archivedAt: null,
  };
  const projects = await ProjectModel.find(allProjectsQuery).sort({ updatedAt: -1 }).limit(6);
  const projectIds = projects.map((project) => project.id);
  const allActiveProjects = await ProjectModel.find(allProjectsQuery).select('_id');
  const allActiveProjectIds = allActiveProjects.map((p) => p._id);
  const [assignedTasks, activity, totalAssignedTasks, completedTasksCount] = await Promise.all([
    TaskModel.find({ assignee: userId, status: { $ne: 'done' } })
      .populate('project', 'name key')
      .sort({ dueDate: 1 })
      .limit(8),
    ActivityLogModel.find({ project: { $in: projectIds } })
      .populate('actor', 'name avatarUrl')
      .populate('project', 'name key')
      .sort({ createdAt: -1 })
      .limit(10),
    TaskModel.countDocuments({ assignee: userId, status: { $ne: 'done' } }),
    TaskModel.countDocuments({ project: { $in: allActiveProjectIds }, status: 'done' }),
  ]);
  return respond(res, 200, 'Dashboard retrieved', {
    statistics: {
      projects: allActiveProjectIds.length,
      assignedTasks: totalAssignedTasks,
      completedTasks: completedTasksCount,
    },
    projects,
    assignedTasks,
    activity,
  });
};
