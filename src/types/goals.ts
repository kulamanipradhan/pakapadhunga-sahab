
export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: 'time' | 'resources' | 'streak';
  targetValue: number;
  currentValue: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  icon: string;
  category: 'streak' | 'time' | 'completion' | 'milestone';
  earnedAt: string;
  createdAt: string;
}

export interface CreateGoalData {
  title: string;
  description?: string;
  type: Goal['type'];
  targetValue: number;
  period: Goal['period'];
  endDate: string;
}
