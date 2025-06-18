
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
      <div className="min-h-screen bg-background p-2 sm:p-4">
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
      <div className="container mx-auto p-3 sm:p-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-4xl font-bold flex items-center gap-2 sm:gap-3">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <span className="truncate">Learning Tracker</span>
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              Welcome back, <span className="truncate inline-block max-w-[200px] sm:max-w-none">{user.email}</span>!
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button onClick={() => setShowForm(true)} size="sm" className="flex-1 sm:flex-none">
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Add Resource</span>
              <span className="xs:hidden">Add</span>
            </Button>
            <Button variant="outline" onClick={handleSignOut} size="sm">
              <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 min-w-[320px]">
              <TabsTrigger value="dashboard" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Home</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Goals & Progress</span>
                <span className="sm:hidden">Goals</span>
              </TabsTrigger>
              <TabsTrigger value="streak" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Streak Calendar</span>
                <span className="sm:hidden">Streak</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Resources ({resources.length})</span>
                <span className="sm:hidden">All ({resources.length})</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            <Dashboard resources={resources} />
          </TabsContent>

          <TabsContent value="goals">
            <GoalsTab />
          </TabsContent>

          <TabsContent value="streak">
            <StreakCalendar />
          </TabsContent>

          <TabsContent value="resources" className="space-y-4 sm:space-y-6">
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
              <div className="text-center py-12 px-4">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {resources.length === 0 ? 'No learning resources yet' : 'No resources match your filters'}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
