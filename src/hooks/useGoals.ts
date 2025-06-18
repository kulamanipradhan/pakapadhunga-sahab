
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Goal, Achievement, CreateGoalData } from '@/types/goals';
import { useToast } from '@/hooks/use-toast';

export const useGoals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGoals();
      fetchAchievements();
    } else {
      setGoals([]);
      setAchievements([]);
      setLoading(false);
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedGoals: Goal[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        type: item.type as Goal['type'],
        targetValue: item.target_value,
        currentValue: item.current_value,
        period: item.period as Goal['period'],
        startDate: item.start_date,
        endDate: item.end_date,
        status: item.status as Goal['status'],
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      setGoals(mappedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load goals',
        variant: 'destructive',
      });
    }
  };

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      const mappedAchievements: Achievement[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        icon: item.icon || '🏆',
        category: item.category as Achievement['category'],
        earnedAt: item.earned_at,
        createdAt: item.created_at,
      }));

      setAchievements(mappedAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: CreateGoalData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: goalData.title,
          description: goalData.description,
          type: goalData.type,
          target_value: goalData.targetValue,
          period: goalData.period,
          end_date: goalData.endDate,
        });

      if (error) throw error;

      await fetchGoals();
      
      toast({
        title: 'Goal created',
        description: 'Your new learning goal has been created successfully.',
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to create goal',
        variant: 'destructive',
      });
    }
  };

  const updateGoalStatus = async (goalId: string, status: Goal['status']) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('goals')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchGoals();
      
      toast({
        title: 'Goal updated',
        description: `Goal status changed to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal',
        variant: 'destructive',
      });
    }
  };

  return {
    goals,
    achievements,
    loading,
    createGoal,
    updateGoalStatus,
    refetch: () => {
      fetchGoals();
      fetchAchievements();
    },
  };
};
