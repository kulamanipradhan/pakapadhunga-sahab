
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Flame, Calendar as CalendarIcon } from 'lucide-react';
import { format, isToday, startOfDay, endOfDay } from 'date-fns';

interface LearningSession {
  id: string;
  session_date: string;
  minutes_studied: number;
}

const StreakCalendar: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLearningSessions();
    }
  }, [user]);

  const fetchLearningSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .select('id, session_date, minutes_studied')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false });

      if (error) throw error;

      setSessions(data || []);
      calculateStreaks(data || []);
    } catch (error) {
      console.error('Error fetching learning sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreaks = (sessions: LearningSession[]) => {
    if (sessions.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }

    // Group sessions by date and calculate daily totals
    const dailyTotals = sessions.reduce((acc, session) => {
      const date = session.session_date;
      acc[date] = (acc[date] || 0) + session.minutes_studied;
      return acc;
    }, {} as Record<string, number>);

    // Get unique dates where user studied (min 15 minutes)
    const studyDates = Object.entries(dailyTotals)
      .filter(([_, minutes]) => minutes >= 15)
      .map(([date]) => date)
      .sort()
      .reverse();

    // Calculate current streak
    let current = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

    // Check if user studied today or yesterday to start streak
    if (studyDates.includes(today)) {
      current = 1;
      for (let i = 1; i < studyDates.length; i++) {
        const currentDate = new Date(studyDates[i - 1]);
        const prevDate = new Date(studyDates[i]);
        const dayDiff = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          current++;
        } else {
          break;
        }
      }
    } else if (studyDates.includes(yesterday)) {
      // Streak continues from yesterday
      current = 1;
      for (let i = 1; i < studyDates.length; i++) {
        if (studyDates[i - 1] === yesterday) {
          for (let j = i; j < studyDates.length; j++) {
            const currentDate = new Date(studyDates[j - 1]);
            const prevDate = new Date(studyDates[j]);
            const dayDiff = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (dayDiff === 1) {
              current++;
            } else {
              break;
            }
          }
          break;
        }
      }
    }

    // Calculate longest streak
    let longest = 0;
    let tempStreak = 1;

    for (let i = 1; i < studyDates.length; i++) {
      const currentDate = new Date(studyDates[i - 1]);
      const prevDate = new Date(studyDates[i]);
      const dayDiff = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longest = Math.max(longest, tempStreak);
        tempStreak = 1;
      }
    }
    longest = Math.max(longest, tempStreak);

    setCurrentStreak(current);
    setLongestStreak(longest);
  };

  const getSessionsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return sessions.filter(session => session.session_date === dateStr);
  };

  const getTotalMinutesForDate = (date: Date) => {
    const sessionData = getSessionsForDate(date);
    return sessionData.reduce((total, session) => total + session.minutes_studied, 0);
  };

  const hasStudiedOnDate = (date: Date) => {
    return getTotalMinutesForDate(date) >= 15; // Minimum 15 minutes for a streak
  };

  const modifiers = {
    studied: (date: Date) => hasStudiedOnDate(date),
  };

  const modifiersStyles = {
    studied: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      fontWeight: 'bold',
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Learning Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{currentStreak}</div>
            <p className="text-sm text-muted-foreground">
              {currentStreak === 1 ? 'day' : 'days'} in a row
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" />
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{longestStreak}</div>
            <p className="text-sm text-muted-foreground">
              {longestStreak === 1 ? 'day' : 'days'} record
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Learning Calendar
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Days with 15+ minutes of study time are highlighted
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border"
            />
            
            {selectedDate && (
              <div className="lg:w-64">
                <h3 className="font-semibold mb-2">
                  {format(selectedDate, 'MMMM d, yyyy')}
                  {isToday(selectedDate) && (
                    <Badge variant="outline" className="ml-2">Today</Badge>
                  )}
                </h3>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {getTotalMinutesForDate(selectedDate)} min
                  </div>
                  
                  {hasStudiedOnDate(selectedDate) && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      Streak Day! 🔥
                    </Badge>
                  )}
                  
                  {getSessionsForDate(selectedDate).length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {getSessionsForDate(selectedDate).length} learning session
                      {getSessionsForDate(selectedDate).length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakCalendar;
