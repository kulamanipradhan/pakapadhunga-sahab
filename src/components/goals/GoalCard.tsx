
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Goal } from '@/types/goals';
import { Target, Calendar, Trophy, Play, Pause, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface GoalCardProps {
  goal: Goal;
  onStatusChange: (goalId: string, status: Goal['status']) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onStatusChange }) => {
  const progressPercentage = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  const isCompleted = goal.status === 'completed' || progressPercentage >= 100;
  const isActive = goal.status === 'active';

  const getTypeIcon = () => {
    switch (goal.type) {
      case 'time': return '⏰';
      case 'resources': return '📚';
      case 'streak': return '🔥';
      default: return '🎯';
    }
  };

  const getTypeLabel = () => {
    switch (goal.type) {
      case 'time': return 'minutes';
      case 'resources': return 'resources';
      case 'streak': return 'days';
      default: return 'units';
    }
  };

  const getStatusColor = () => {
    switch (goal.status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getTypeIcon()}</span>
            <div>
              <CardTitle className="text-lg">{goal.title}</CardTitle>
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
              )}
            </div>
          </div>
          <Badge variant="outline" className={getStatusColor()}>
            {goal.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">
              {goal.currentValue} / {goal.targetValue} {getTypeLabel()}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-right text-xs text-muted-foreground">
            {progressPercentage.toFixed(1)}% complete
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{goal.period}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>Due: {format(new Date(goal.endDate), 'MMM d')}</span>
          </div>
        </div>

        {isCompleted && (
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <Trophy className="h-4 w-4" />
            <span>Goal Completed! 🎉</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {isActive && !isCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(goal.id, 'paused')}
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}
          
          {goal.status === 'paused' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(goal.id, 'active')}
            >
              <Play className="h-4 w-4 mr-1" />
              Resume
            </Button>
          )}
          
          {!isCompleted && goal.status !== 'completed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(goal.id, 'completed')}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalCard;
