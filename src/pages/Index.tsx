import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseLearningData } from '@/hooks/useSupabaseLearningData';
import { LearningResource } from '@/types/learning';
import Dashboard from '@/components/Dashboard';
import ResourceCard from '@/components/ResourceCard';
import ResourceForm from '@/components/ResourceForm';
import FilterBar from '@/components/FilterBar';
import StreakCalendar from '@/components/StreakCalendar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GoalsTab from '@/components/goals/GoalsTab';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { resources, loading, saveResource, updateResource, logLearningSession } = useSupabaseLearningData();
  
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | undefined>();
  const [statusFilter, setStatusFilter] = useState<LearningResource['status'] | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<LearningResource['type'] | 'all'>('all');
  const [tagFilter, setTagFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return null;
  }

  const handleSaveResource = async (resourceData: Omit<LearningResource, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingResource) {
      await updateResource(editingResource.id, resourceData);
    } else {
      await saveResource(resourceData);
    }
    
    setShowForm(false);
    setEditingResource(undefined);
  };

  const handleEditResource = (resource: LearningResource) => {
    setEditingResource(resource);
    setShowForm(true);
  };

  const handleStatusChange = async (id: string, status: LearningResource['status']) => {
    await updateResource(id, { status });
  };

  const handleTimeLog = async (id: string, minutes: number) => {
    await logLearningSession(id, minutes);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setTagFilter('');
    setSearchQuery('');
  };

  // Get unique tags from all resources
  const allTags = [...new Set(resources.flatMap(r => r.tags))].sort();

  // Filter resources based on current filters
  const filteredResources = resources.filter(resource => {
    const matchesStatus = statusFilter === 'all' || resource.status === statusFilter;
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    const matchesTag = !tagFilter || resource.tags.includes(tagFilter);
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesType && matchesTag && matchesSearch;
  });

  if (showForm) {
    return (
      <div className="min-h-screen bg-background p-4">
        <ResourceForm
          resource={editingResource}
          onSave={handleSaveResource}
          onCancel={() => {
            setShowForm(false);
            setEditingResource(undefined);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              Learning Tracker
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user.email}! Track your learning journey and build daily streaks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowForm(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add Resource
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="goals">Goals & Progress</TabsTrigger>
            <TabsTrigger value="streak">Streak Calendar</TabsTrigger>
            <TabsTrigger value="resources">Resources ({resources.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard resources={resources} />
          </TabsContent>

          <TabsContent value="goals">
            <GoalsTab />
          </TabsContent>

          <TabsContent value="streak">
            <StreakCalendar />
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <FilterBar
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              tagFilter={tagFilter}
              searchQuery={searchQuery}
              availableTags={allTags}
              onStatusFilterChange={setStatusFilter}
              onTypeFilterChange={setTypeFilter}
              onTagFilterChange={setTagFilter}
              onSearchChange={setSearchQuery}
              onClearFilters={handleClearFilters}
            />

            {loading ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground">Loading your resources...</p>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {resources.length === 0 ? 'No learning resources yet' : 'No resources match your filters'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {resources.length === 0 
                    ? 'Start your learning journey by adding your first resource!'
                    : 'Try adjusting your filters to see more resources.'
                  }
                </p>
                {resources.length === 0 && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Resource
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onEdit={handleEditResource}
                    onStatusChange={handleStatusChange}
                    onTimeLog={handleTimeLog}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
