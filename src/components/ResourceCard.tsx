
import React, { useState } from 'react';
import { LearningResource } from '@/types/learning';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, ExternalLink, Edit3, Timer } from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';

interface ResourceCardProps {
  resource: LearningResource;
  onEdit: (resource: LearningResource) => void;
  onStatusChange: (id: string, status: LearningResource['status']) => void;
  onTimeLog: (id: string, minutes: number) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onEdit,
  onStatusChange,
  onTimeLog,
}) => {
  const [timeInput, setTimeInput] = useState('');
  const [showTimeInput, setShowTimeInput] = useState(false);

  const getStatusColor = (status: LearningResource['status']) => {
    switch (status) {
      case 'not-started':
        return 'bg-gray-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: LearningResource['status']) => {
    switch (status) {
      case 'not-started':
        return 'Not Started';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const getTypeIcon = (type: LearningResource['type']) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'blog':
        return '📝';
      case 'article':
        return '📄';
      case 'course':
        return '🎓';
      default:
        return '📚';
    }
  };

  const isOverdue = resource.deadline && isAfter(new Date(), parseISO(resource.deadline)) && resource.status !== 'completed';

  const handleTimeLog = () => {
    const minutes = parseInt(timeInput);
    if (minutes > 0) {
      onTimeLog(resource.id, minutes);
      setTimeInput('');
      setShowTimeInput(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>{getTypeIcon(resource.type)}</span>
            {resource.title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(resource)}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={getStatusColor(resource.status)}>
            {getStatusText(resource.status)}
          </Badge>
          <Badge variant="outline">{resource.type}</Badge>
          {resource.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {resource.notes && (
          <p className="text-sm text-muted-foreground">{resource.notes}</p>
        )}
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {resource.deadline && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
              <Calendar className="h-4 w-4" />
              {format(parseISO(resource.deadline), 'MMM dd, yyyy')}
              {isOverdue && ' (Overdue)'}
            </div>
          )}
          
          {resource.timeSpent > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(resource.timeSpent)}
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {resource.status === 'not-started' && (
            <Button
              size="sm"
              onClick={() => onStatusChange(resource.id, 'in-progress')}
            >
              Start Learning
            </Button>
          )}
          
          {resource.status === 'in-progress' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(resource.id, 'completed')}
            >
              Mark Complete
            </Button>
          )}
          
          {resource.url && (
            <Button size="sm" variant="outline" asChild>
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Open
              </a>
            </Button>
          )}
          
          {!showTimeInput ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowTimeInput(true)}
            >
              <Timer className="h-4 w-4 mr-1" />
              Log Time
            </Button>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Minutes"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                className="w-20 px-2 py-1 text-sm border rounded"
              />
              <Button size="sm" onClick={handleTimeLog}>
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowTimeInput(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
