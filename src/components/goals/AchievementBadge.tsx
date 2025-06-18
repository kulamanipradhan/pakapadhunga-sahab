
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Achievement } from '@/types/goals';
import { format } from 'date-fns';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <Badge 
      variant="outline" 
      className={`${sizeClasses[size]} bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-800 hover:from-yellow-100 hover:to-orange-100`}
      title={`${achievement.title} - Earned ${format(new Date(achievement.earnedAt), 'MMM d, yyyy')}`}
    >
      <span className={`mr-1 ${iconSizes[size]}`}>{achievement.icon}</span>
      {achievement.title}
    </Badge>
  );
};

export default AchievementBadge;
