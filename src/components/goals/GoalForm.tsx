
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateGoalData } from '@/types/goals';
import { X, Target } from 'lucide-react';
import { addDays, addWeeks, addMonths, format } from 'date-fns';

interface GoalFormProps {
  onSave: (goalData: CreateGoalData) => void;
  onCancel: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<CreateGoalData>({
    title: '',
    description: '',
    type: 'time',
    targetValue: 0,
    period: 'weekly',
    endDate: '',
  });

  const calculateEndDate = (period: CreateGoalData['period']) => {
    const today = new Date();
    switch (period) {
      case 'weekly':
        return format(addWeeks(today, 1), 'yyyy-MM-dd');
      case 'monthly':
        return format(addMonths(today, 1), 'yyyy-MM-dd');
      case 'yearly':
        return format(addMonths(today, 12), 'yyyy-MM-dd');
      default:
        return format(addWeeks(today, 1), 'yyyy-MM-dd');
    }
  };

  const handlePeriodChange = (period: CreateGoalData['period']) => {
    setFormData(prev => ({
      ...prev,
      period,
      endDate: calculateEndDate(period),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.targetValue || !formData.endDate) return;
    
    onSave(formData);
  };

  const getTypeLabel = () => {
    switch (formData.type) {
      case 'time': return 'minutes';
      case 'resources': return 'resources';
      case 'streak': return 'days';
      default: return 'units';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Create New Goal
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Study 5 hours this week"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add details about your goal..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Goal Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: CreateGoalData['type']) => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">⏰ Time-based (minutes)</SelectItem>
                <SelectItem value="resources">📚 Resource completion</SelectItem>
                <SelectItem value="streak">🔥 Streak (days)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Time Period</Label>
            <Select 
              value={formData.period} 
              onValueChange={handlePeriodChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">📅 Weekly</SelectItem>
                <SelectItem value="monthly">🗓️ Monthly</SelectItem>
                <SelectItem value="yearly">📆 Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetValue">Target ({getTypeLabel()})</Label>
            <Input
              id="targetValue"
              type="number"
              min="1"
              value={formData.targetValue || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                targetValue: parseInt(e.target.value) || 0 
              }))}
              placeholder={`Enter target number of ${getTypeLabel()}`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              min={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Create Goal
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GoalForm;
