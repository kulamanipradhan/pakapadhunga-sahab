
import React, { useState, useEffect } from 'react';
import { LearningResource } from '@/types/learning';
import Dashboard from '@/components/Dashboard';
import ResourceCard from '@/components/ResourceCard';
import ResourceForm from '@/components/ResourceForm';
import FilterBar from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | undefined>();
  const [statusFilter, setStatusFilter] = useState<LearningResource['status'] | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<LearningResource['type'] | 'all'>('all');
  const [tagFilter, setTagFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Load resources from localStorage on component mount
  useEffect(() => {
    const savedResources = localStorage.getItem('learningResources');
    if (savedResources) {
      setResources(JSON.parse(savedResources));
    }
  }, []);

  // Save resources to localStorage whenever resources change
  useEffect(() => {
    localStorage.setItem('learningResources', JSON.stringify(resources));
  }, [resources]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleSaveResource = (resourceData: Omit<LearningResource, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (editingResource) {
      setResources(resources.map(r => 
        r.id === editingResource.id 
          ? { ...resourceData, id: editingResource.id, createdAt: editingResource.createdAt, updatedAt: now }
          : r
      ));
      toast({
        title: "Resource updated",
        description: "Your learning resource has been updated successfully.",
      });
    } else {
      const newResource: LearningResource = {
        ...resourceData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      setResources([newResource, ...resources]);
      toast({
        title: "Resource added",
        description: "Your new learning resource has been added successfully.",
      });
    }
    
    setShowForm(false);
    setEditingResource(undefined);
  };

  const handleEditResource = (resource: LearningResource) => {
    setEditingResource(resource);
    setShowForm(true);
  };

  const handleStatusChange = (id: string, status: LearningResource['status']) => {
    setResources(resources.map(r => 
      r.id === id 
        ? { ...r, status, updatedAt: new Date().toISOString() }
        : r
    ));
    
    const statusMessages = {
      'not-started': 'Resource marked as not started',
      'in-progress': 'Started learning! Good luck! 🎯',
      'completed': 'Congratulations on completing this resource! 🎉'
    };
    
    toast({
      title: statusMessages[status],
    });
  };

  const handleTimeLog = (id: string, minutes: number) => {
    setResources(resources.map(r => 
      r.id === id 
        ? { ...r, timeSpent: r.timeSpent + minutes, updatedAt: new Date().toISOString() }
        : r
    ));
    
    toast({
      title: "Time logged",
      description: `Added ${minutes} minutes to your learning time.`,
    });
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
              Track your self-learning journey across videos, blogs, and courses
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Add Resource
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="resources">Resources ({resources.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard resources={resources} />
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

            {filteredResources.length === 0 ? (
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
