
import React from 'react';
import { LearningResource } from '@/types/learning';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Search } from 'lucide-react';

interface FilterBarProps {
  statusFilter: LearningResource['status'] | 'all';
  typeFilter: LearningResource['type'] | 'all';
  tagFilter: string;
  searchQuery: string;
  availableTags: string[];
  onStatusFilterChange: (status: LearningResource['status'] | 'all') => void;
  onTypeFilterChange: (type: LearningResource['type'] | 'all') => void;
  onTagFilterChange: (tag: string) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  statusFilter,
  typeFilter,
  tagFilter,
  searchQuery,
  availableTags,
  onStatusFilterChange,
  onTypeFilterChange,
  onTagFilterChange,
  onSearchChange,
  onClearFilters,
}) => {
  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || tagFilter !== '' || searchQuery !== '';

  const handleTagFilterChange = (value: string) => {
    // Convert "all-tags" back to empty string for the parent component
    onTagFilterChange(value === 'all-tags' ? '' : value);
  };

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-64"
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
            <SelectItem value="article">Article</SelectItem>
            <SelectItem value="course">Course</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tagFilter || 'all-tags'} onValueChange={handleTagFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-tags">All Tags</SelectItem>
            {availableTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="outline" onClick={onClearFilters} size="sm">
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {statusFilter !== 'all' && (
            <Badge variant="secondary">
              Status: {statusFilter}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => onStatusFilterChange('all')}
              />
            </Badge>
          )}
          {typeFilter !== 'all' && (
            <Badge variant="secondary">
              Type: {typeFilter}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => onTypeFilterChange('all')}
              />
            </Badge>
          )}
          {tagFilter && (
            <Badge variant="secondary">
              Tag: {tagFilter}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => onTagFilterChange('')}
              />
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary">
              Search: "{searchQuery}"
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => onSearchChange('')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
