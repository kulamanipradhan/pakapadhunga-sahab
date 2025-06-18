
import React, { useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
import GoalCard from './GoalCard';
import GoalForm from './GoalForm';
import AchievementBadge from './AchievementBadge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Target, Trophy, BookOpen } from 'lucide-react';

const GoalsTab: React.FC = () => {
  const { goals, achievements, loading, createGoal, updateGoalStatus } = useGoals();
  const [showGoalForm, setShowGoalForm] = useState(false);

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');

  if (loading) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading your goals...</p>
      </div>
    );
  }

  if (showGoalForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <GoalForm
          onSave={async (goalData) => {
            await createGoal(goalData);
            setShowGoalForm(false);
          }}
          onCancel={() => setShowGoalForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            Goals & Progress
          </h2>
          <p className="text-muted-foreground">
            Set learning goals and track your progress
          </p>
        </div>
        <Button onClick={() => setShowGoalForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {achievements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Recent Achievements
          </h3>
          <div className="flex flex-wrap gap-2">
            {achievements.slice(0, 5).map((achievement) => (
              <AchievementBadge 
                key={achievement.id} 
                achievement={achievement} 
              />
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Goals ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedGoals.length})
          </TabsTrigger>
          <TabsTrigger value="achievements">
            Achievements ({achievements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeGoals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No active goals</h3>
              <p className="text-muted-foreground mb-4">
                Create your first learning goal to start tracking progress!
              </p>
              <Button onClick={() => setShowGoalForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onStatusChange={updateGoalStatus}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedGoals.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No completed goals yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onStatusChange={updateGoalStatus}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements">
          {achievements.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No achievements yet</p>
              <p className="text-sm text-muted-foreground">
                Complete goals and maintain streaks to earn achievements!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className="p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h4 className="font-semibold text-sm">{achievement.title}</h4>
                    {achievement.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoalsTab;
