import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireProjectAccess, requireTaskAccess } from '../middleware/project-access.js';
import * as auth from '../controllers/auth-controller.js';
import * as projects from '../controllers/project-controller.js';
import * as tasks from '../controllers/task-controller.js';
import * as comments from '../controllers/comment-controller.js';
import * as dashboard from '../controllers/dashboard-controller.js';
import * as notifications from '../controllers/notification-controller.js';
import { asyncHandler } from '../utils/async-handler.js';
const router = Router();
const protect = (handler: (req: Request, res: Response) => Promise<unknown>) => [
  requireAuth,
  asyncHandler(handler),
];
router.post('/auth/register', asyncHandler(auth.register));
router.post('/auth/login', asyncHandler(auth.login));
router.post('/auth/refresh', asyncHandler(auth.refresh));
router.post('/auth/forgot-password', asyncHandler(auth.forgotPassword));
router.post('/auth/logout', ...protect(auth.logout));
router.get('/auth/me', ...protect(auth.profile));
router.patch('/auth/me', ...protect(auth.updateProfile));
router.get('/projects', ...protect(projects.listProjects));
router.post('/projects', ...protect(projects.createProject));
router.get(
  '/projects/:projectId',
  requireAuth,
  requireProjectAccess,
  asyncHandler(projects.getProject),
);
router.patch(
  '/projects/:projectId',
  requireAuth,
  requireProjectAccess,
  asyncHandler(projects.updateProject),
);
router.delete(
  '/projects/:projectId',
  requireAuth,
  requireProjectAccess,
  asyncHandler(projects.deleteProject),
);
router.post(
  '/projects/:projectId/archive',
  requireAuth,
  requireProjectAccess,
  asyncHandler(projects.archiveProject),
);
router.get(
  '/projects/:projectId/tasks',
  requireAuth,
  requireProjectAccess,
  asyncHandler(tasks.listTasks),
);
router.post(
  '/projects/:projectId/tasks',
  requireAuth,
  requireProjectAccess,
  asyncHandler(tasks.createTask),
);
router.get('/tasks/:taskId', ...protect(tasks.getTask));
router.patch('/tasks/:taskId', requireAuth, requireTaskAccess, asyncHandler(tasks.updateTask));
router.delete('/tasks/:taskId', requireAuth, requireTaskAccess, asyncHandler(tasks.deleteTask));
router.get(
  '/tasks/:taskId/comments',
  requireAuth,
  requireTaskAccess,
  asyncHandler(comments.listComments),
);
router.post(
  '/tasks/:taskId/comments',
  requireAuth,
  requireTaskAccess,
  asyncHandler(comments.createComment),
);
router.patch('/comments/:commentId', ...protect(comments.updateComment));
router.delete('/comments/:commentId', ...protect(comments.deleteComment));
router.get('/dashboard', ...protect(dashboard.dashboard));
router.get('/notifications', ...protect(notifications.listNotifications));
router.patch('/notifications/:notificationId/read', ...protect(notifications.readNotification));
export default router;
