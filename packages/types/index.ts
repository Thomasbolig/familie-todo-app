// Core entity types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'parent' | 'child' | 'guest';
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Family {
  id: string;
  name: string;
  ownerId: string;
  members: FamilyMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyMember {
  id: string;
  userId: string;
  familyId: string;
  role: 'owner' | 'parent' | 'child' | 'guest';
  permissions: Permission[];
  joinedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  familyId: string;
  ownerId: string;
  status: 'active' | 'completed' | 'archived';
  priority: Priority;
  dueDate?: Date;
  visibility: Visibility;
  sharedWith: string[]; // user IDs
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  parentTaskId?: string; // for subtasks
  assignedTo?: string; // user ID
  createdBy: string; // user ID
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  estimatedMinutes?: number;
  actualMinutes?: number;
  visibility: Visibility;
  sharedWith: string[]; // user IDs
  tags: string[];
  attachments: Attachment[];
  comments: Comment[];
  subtasks: Task[];
  dependencies: string[]; // task IDs this task depends on
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string; // user ID
  uploadedAt: Date;
}

export interface Child {
  id: string;
  familyId: string;
  name: string;
  birthDate: Date;
  grade?: string;
  school?: string;
  activities: Activity[];
  calendar: CalendarEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  childId: string;
  name: string;
  type: 'sport' | 'music' | 'art' | 'academic' | 'social' | 'other';
  location?: string;
  instructor?: string;
  schedule: ActivitySchedule[];
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivitySchedule {
  id: string;
  activityId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:MM format
  endTime: string;
  location?: string;
  needsTransport: boolean;
  transportAssignedTo?: string; // user ID
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  childId?: string; // null for family events
  familyId: string;
  title: string;
  description?: string;
  type: 'task' | 'activity' | 'appointment' | 'birthday' | 'school' | 'transport' | 'other';
  startDateTime: Date;
  endDateTime?: Date;
  isAllDay: boolean;
  location?: string;
  assignedTo?: string; // user ID
  reminders: Reminder[];
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  createdBy: string; // user ID
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  type: 'push' | 'email' | 'sms';
  minutesBefore: number;
  enabled: boolean;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number; // every X days/weeks/months
  daysOfWeek?: number[]; // for weekly patterns
  dayOfMonth?: number; // for monthly patterns
  endDate?: Date;
  maxOccurrences?: number;
}

// Enums and Union Types
export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'waiting' | 'completed' | 'cancelled';
export type Visibility = 'private' | 'family' | 'custom';
export type Permission = 'view' | 'create' | 'edit' | 'delete' | 'share' | 'admin';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard and Statistics
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  tasksToday: number;
  projectsActive: number;
  upcomingDeadlines: Task[];
  recentActivity: ActivityFeedItem[];
}

export interface ActivityFeedItem {
  id: string;
  type: 'task_created' | 'task_completed' | 'task_assigned' | 'comment_added' | 'project_created';
  userId: string;
  userName: string;
  taskId?: string;
  taskTitle?: string;
  projectId?: string;
  projectTitle?: string;
  message: string;
  timestamp: Date;
}

// Form and UI Types
export interface CreateTaskForm {
  title: string;
  description?: string;
  projectId: string;
  parentTaskId?: string;
  assignedTo?: string;
  priority: Priority;
  dueDate?: Date;
  estimatedMinutes?: number;
  visibility: Visibility;
  sharedWith: string[];
  tags: string[];
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
}

export interface CreateProjectForm {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: Date;
  visibility: Visibility;
  sharedWith: string[];
}

export interface FilterOptions {
  status?: TaskStatus[];
  priority?: Priority[];
  assignedTo?: string[];
  dueDate?: {
    from?: Date;
    to?: Date;
  };
  tags?: string[];
  projects?: string[];
}

export interface SortOptions {
  field: 'dueDate' | 'priority' | 'createdAt' | 'title' | 'status';
  direction: 'asc' | 'desc';
}

// Notification Types
export interface NotificationSettings {
  id: string;
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  taskAssigned: boolean;
  taskDue: boolean;
  taskCompleted: boolean;
  commentMentioned: boolean;
  projectShared: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'task_assigned' | 'task_due' | 'task_completed' | 'comment_mentioned' | 'project_shared';
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

// Color scheme for priorities
export const PRIORITY_COLORS = {
  high: '#FF4444',    // Red
  medium: '#FFB84D',  // Orange/Yellow
  low: '#4CAF50'      // Green
} as const;