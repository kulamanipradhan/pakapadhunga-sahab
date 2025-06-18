
import React, { useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
import GoalCard from './GoalCard';
import GoalForm from './GoalForm';
import AchievementBadge from './AchievementBadge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Target, Trophy } from 'lucide-react';

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
      <div className="max-w-2xl mx-auto px-2 sm:px-0">
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Target className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span>Goals & Progress</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            Set learning goals and track your progress
          </p>
        </div>
        <Button onClick={() => setShowGoalForm(true)} size="sm" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
            Recent Achievements
          </h3>
          <div className="flex flex-wrap gap-2">
            {achievements.slice(0, 5).map((achievement) => (
              <AchievementBadge 
                key={achievement.id} 
                achievement={achievement}
                size="sm"
              />
            ))}
          </div>
        </div>
      )}

      {/* Goals Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-3 min-w-[280px]">
            <TabsTrigger value="active" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Active Goals ({activeGoals.length})</span>
              <span className="sm:hidden">Active ({activeGoals.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Completed ({completedGoals.length})</span>
              <span className="sm:hidden">Done ({completedGoals.length})</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Achievements ({achievements.length})</span>
              <span className="sm:hidden">Awards ({achievements.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active">
          {activeGoals.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No active goals</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Create your first learning goal to start tracking progress!
              </p>
              <Button onClick={() => setShowGoalForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
            <div className="text-center py-12 px-4">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No completed goals yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
            <div className="text-center py-12 px-4">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No achievements yet</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Complete goals and maintain streaks to earn achievements!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className="p-3 sm:p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                >
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl mb-2">{achievement.icon}</div>
                    <h4 className="font-semibold text-xs sm:text-sm">{achievement.title}</h4>
                    {achievement.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
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
