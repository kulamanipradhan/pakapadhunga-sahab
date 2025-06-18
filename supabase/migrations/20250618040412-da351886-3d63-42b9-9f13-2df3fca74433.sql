
-- Create goals table
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('time', 'resources', 'streak')),
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏆',
  category TEXT NOT NULL CHECK (category IN ('streak', 'time', 'completion', 'milestone')),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Goals policies
CREATE POLICY "Users can view their own goals" 
  ON public.goals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
  ON public.goals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
  ON public.goals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
  ON public.goals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view their own achievements" 
  ON public.achievements 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements" 
  ON public.achievements 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update time-based goals when learning sessions are added
  IF TG_TABLE_NAME = 'learning_sessions' THEN
    UPDATE public.goals 
    SET 
      current_value = (
        SELECT COALESCE(SUM(minutes_studied), 0)
        FROM public.learning_sessions ls
        WHERE ls.user_id = NEW.user_id
          AND ls.session_date >= goals.start_date
          AND ls.session_date <= goals.end_date
      ),
      updated_at = now()
    WHERE user_id = NEW.user_id 
      AND type = 'time'
      AND status = 'active'
      AND NEW.session_date >= start_date
      AND NEW.session_date <= end_date;
  END IF;

  -- Update resource-based goals when learning resources are completed
  IF TG_TABLE_NAME = 'learning_resources' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.goals 
    SET 
      current_value = (
        SELECT COUNT(*)
        FROM public.learning_resources lr
        WHERE lr.user_id = NEW.user_id
          AND lr.status = 'completed'
          AND lr.updated_at >= goals.start_date
          AND lr.updated_at <= goals.end_date + INTERVAL '1 day'
      ),
      updated_at = now()
    WHERE user_id = NEW.user_id 
      AND type = 'resources'
      AND status = 'active';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_goals_on_session
  AFTER INSERT ON public.learning_sessions
  FOR EACH ROW EXECUTE FUNCTION update_goal_progress();

CREATE TRIGGER update_goals_on_resource_completion
  AFTER UPDATE ON public.learning_resources
  FOR EACH ROW EXECUTE FUNCTION update_goal_progress();
