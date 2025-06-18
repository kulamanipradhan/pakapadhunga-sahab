
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LearningResource } from '@/types/learning';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseLearningData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchResources();
    } else {
      setResources([]);
      setLoading(false);
    }
  }, [user]);

  const fetchResources = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map database columns to LearningResource interface
      const mappedResources: LearningResource[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        type: item.type as LearningResource['type'],
        url: item.url || '',
        notes: item.notes || '',
        status: item.status as LearningResource['status'],
        deadline: item.deadline || '',
        tags: item.tags || [],
        timeSpent: item.time_spent || 0,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      setResources(mappedResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: 'Error',
        description: 'Failed to load learning resources',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveResource = async (resourceData: Omit<LearningResource, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('learning_resources')
        .insert({
          user_id: user.id,
          title: resourceData.title,
          type: resourceData.type,
          url: resourceData.url,
          notes: resourceData.notes,
          status: resourceData.status,
          deadline: resourceData.deadline,
          tags: resourceData.tags,
          time_spent: resourceData.timeSpent,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchResources();
      
      toast({
        title: 'Resource added',
        description: 'Your new learning resource has been added successfully.',
      });
    } catch (error) {
      console.error('Error saving resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to save learning resource',
        variant: 'destructive',
      });
    }
  };

  const updateResource = async (id: string, updates: Partial<LearningResource>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('learning_resources')
        .update({
          title: updates.title,
          type: updates.type,
          url: updates.url,
          notes: updates.notes,
          status: updates.status,
          deadline: updates.deadline,
          tags: updates.tags,
          time_spent: updates.timeSpent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchResources();
    } catch (error) {
      console.error('Error updating resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to update learning resource',
        variant: 'destructive',
      });
    }
  };

  const logLearningSession = async (resourceId: string, minutes: number) => {
    if (!user) return;

    try {
      // Add learning session
      const { error: sessionError } = await supabase
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          resource_id: resourceId,
          minutes_studied: minutes,
        });

      if (sessionError) throw sessionError;

      // Update resource time spent
      const resource = resources.find(r => r.id === resourceId);
      if (resource) {
        await updateResource(resourceId, { 
          timeSpent: resource.timeSpent + minutes 
        });
      }

      toast({
        title: 'Time logged',
        description: `Added ${minutes} minutes to your learning time.`,
      });
    } catch (error) {
      console.error('Error logging session:', error);
      toast({
        title: 'Error',
        description: 'Failed to log learning session',
        variant: 'destructive',
      });
    }
  };

  return {
    resources,
    loading,
    saveResource,
    updateResource,
    logLearningSession,
    refetch: fetchResources,
  };
};
