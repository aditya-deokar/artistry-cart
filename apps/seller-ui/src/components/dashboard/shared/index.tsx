// components/dashboard/shared/index.ts

// Core components
export { DataTable } from './DataTable';
export { DashboardCard } from './DashboardCard';
export { StatsCard } from './StatsCard';
export { ChartContainer } from './ChartContainer';

// Interactive components
export { FilterSidebar } from './FilterSidebar';
export { BulkActionBar, commonBulkActions } from './BulkActionBar';
export { StatusBadge } from './StatusBadge';
export { ActionDropdown } from './ActionDropdown';

// Input components
export { SearchInput } from './SearchInput';
export { DateRangePicker } from './DateRangePicker';
export { CategorySelector } from './CategorySelector';
export { ImageUploadZone } from './ImageUploadZone';

// Form components
export { FormWrapper } from './FormWrapper';

// State components
export { LoadingState } from './LoadingState';
export { EmptyState } from './EmptyState';
export { ConfirmDialog, useConfirmDialog } from './ConfirmDialog';

// Types
export type { 
  FilterGroup, 
  FilterOption 
} from './FilterSidebar';

export type { 
  BulkAction, 
  ActionGroup 
} from './BulkActionBar';

export type { 
  StatusType 
} from './StatusBadge';

export type { 
  ActionItem, 
  ActionGroup as DropdownActionGroup 
} from './ActionDropdown';

export type { 
  SearchSuggestion, 
  SearchFilter 
} from './SearchInput';

export type { 
  DateRangePreset 
} from './DateRangePicker';

export type { 
  Category 
} from './CategorySelector';

export type { 
  UploadedFile 
} from './ImageUploadZone';


