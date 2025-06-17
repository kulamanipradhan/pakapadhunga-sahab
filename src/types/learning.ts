
export interface LearningResource {
  id: string;
  title: string;
  type: 'video' | 'blog' | 'article' | 'course';
  url?: string;
  notes: string;
  status: 'not-started' | 'in-progress' | 'completed';
  deadline?: string;
  tags: string[];
  timeSpent: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface LearningStats {
  total: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  totalTimeSpent: number;
}
