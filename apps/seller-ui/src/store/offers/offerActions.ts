// store/offers/offerActions.ts
import { useOfferStore } from './offerStore';
import { 
  Offer, 
  CreateOfferRequest, 
  UpdateOfferRequest, 
  OfferFilters, 
  BulkOfferOperation,
  BulkOperationResult,
  SeasonalOffer,
  FlashSaleOffer,
  PricingStrategy,
  OfferStatus,
  OfferType,
  Priority
} from './offerTypes';
import { toast } from 'sonner';

// API functions (these would typically be in a separate API layer)
import {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  bulkUpdateOffers,
  bulkDeleteOffers,
  duplicateOffer,
  getOfferAnalytics,
  validateOfferCode,
  applyOfferCode,
} from '@/lib/api/offers';

/**
 * Offer CRUD Actions
 */
export const offerActions = {
  // Fetch offers with optional filters
  async fetchOffers(filters?: OfferFilters, page = 1, limit = 20) {
    const store = useOfferStore.getState();
    
    try {
      store.setLoading(true);
      store.clearError();
      
      const response = await getOffers({ ...filters, page, limit });
      
      store.setOffers(response.offers);
      store.setPage(page);
      store.setLimit(limit);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch offers';
      store.setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      store.setLoading(false);
    }
  },

  // Create a new offer
  async createOffer(offerData: CreateOfferRequest): Promise<Offer> {
    const store = useOfferStore.getState();
    
    try {
      store.setLoading(true);
      store.clearError();
      
      const newOffer = await createOffer(offerData);
      store.addOffer(newOffer);
      
      toast.success('Offer created successfully!');
      return newOffer;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create offer';
      store.setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      store.setLoading(false);
    }
  },

  // Update an existing offer
  async updateOffer(id: string, updates: UpdateOfferRequest): Promise<Offer> {
    const store = useOfferStore.getState();
    
    try {
      store.setLoading(true);
      store.clearError();
      
      const updatedOffer = await updateOffer(id, updates);
      store.updateOffer(id, updatedOffer);
      
      toast.success('Offer updated successfully!');
      return updatedOffer;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update offer';
      store.setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      store.setLoading(false);
    }
  },

  // Delete an offer
  async deleteOffer(id: string): Promise<void> {
    const store = useOfferStore.getState();
    
    try {
      store.setLoading(true);
      store.clearError();
      
      await deleteOffer(id);
      store.deleteOffer(id);
      
      toast.success('Offer deleted successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete offer';
      store.setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      store.setLoading(false);
    }
  },

  // Duplicate an offer
  async duplicateOffer(id: string): Promise<Offer> {
    const store = useOfferStore.getState();
    
    try {
      store.setLoading(true);
      store.clearError();
      
      const duplicatedOffer = await duplicateOffer(id);
      store.addOffer(duplicatedOffer);
      
      toast.success('Offer duplicated successfully!');
      return duplicatedOffer;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to duplicate offer';
      store.setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      store.setLoading(false);
    }
  },

  // Bulk operations
  async bulkOperation(operation: BulkOfferOperation): Promise<BulkOperationResult> {
    const store = useOfferStore.getState();
    
    try {
      store.setLoading(true);
      store.clearError();
      
      let result: BulkOperationResult;
      
      switch (operation.action) {
        case 'update':
          if (!operation.updates) {
            throw new Error('Updates are required for bulk update operation');
          }
          result = await bulkUpdateOffers(operation.offerIds, operation.updates);
          // Update local state for successful updates
          result.success.forEach(id => {
            store.updateOffer(id, operation.updates!);
          });
          break;
          
        case 'delete':
          result = await bulkDeleteOffers(operation.offerIds);
          // Remove from local state for successful deletions
          result.success.forEach(id => {
            store.deleteOffer(id);
          });
          break;
          
        case 'activate':
          result = await bulkUpdateOffers(operation.offerIds, { status: OfferStatus.ACTIVE });
          result.success.forEach(id => {
            store.updateOffer(id, { status: OfferStatus.ACTIVE });
          });
          break;
          
        case 'deactivate':
          result = await bulkUpdateOffers(operation.offerIds, { status: OfferStatus.PAUSED });
          result.success.forEach(id => {
            store.updateOffer(id, { status: OfferStatus.PAUSED });
          });
          break;
          
        case 'duplicate':
          // Handle bulk duplication
          const promises = operation.offerIds.map(id => duplicateOffer(id));
          const duplicatedOffers = await Promise.allSettled(promises);
          
          result = {
            success: [],
            failed: [],
            summary: { total: 0, successful: 0, failed: 0 }
          };
          
          duplicatedOffers.forEach((promiseResult, index) => {
            const originalId = operation.offerIds[index];
            if (promiseResult.status === 'fulfilled') {
              store.addOffer(promiseResult.value);
              result.success.push(originalId);
            } else {
              result.failed.push({
                id: originalId,
                error: {
                  code: 'DUPLICATION_FAILED',
                  message: promiseResult.reason.message || 'Failed to duplicate offer'
                }
              });
            }
          });
          
          result.summary = {
            total: operation.offerIds.length,
            successful: result.success.length,
            failed: result.failed.length
          };
          break;
          
        default:
          throw new Error(`Unsupported bulk operation: ${operation.action}`);
      }
      
      // Show success/error messages
      if (result.summary.successful > 0) {
        toast.success(`${result.summary.successful} offer(s) ${operation.action}d successfully!`);
      }
      
      if (result.summary.failed > 0) {
        toast.error(`Failed to ${operation.action} ${result.summary.failed} offer(s)`);
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || `Failed to perform bulk ${operation.action}`;
      store.setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      store.setLoading(false);
    }
  },
};

/**
 * Offer Status Actions
 */
export const offerStatusActions = {
  // Activate an offer
  async activateOffer(id: string): Promise<void> {
    await offerActions.updateOffer(id, { status: OfferStatus.ACTIVE });
  },

  // Deactivate an offer
  async deactivateOffer(id: string): Promise<void> {
    await offerActions.updateOffer(id, { status: OfferStatus.PAUSED });
  },

  // Schedule an offer
  async scheduleOffer(id: string, startDate: string): Promise<void> {
    await offerActions.updateOffer(id, { 
      status: OfferStatus.SCHEDULED,
      startDate 
    });
  },

  // End an offer
  async endOffer(id: string): Promise<void> {
    await offerActions.updateOffer(id, { 
      status: OfferStatus.ENDED,
      endDate: new Date().toISOString()
    });
  },

  // Auto-activate scheduled offers
  async autoActivateOffers(): Promise<void> {
    const store = useOfferStore.getState();
    const now = new Date();
    
    const offersToActivate = store.offers.filter(offer => 
      offer.status === OfferStatus.SCHEDULED &&
      new Date(offer.startDate) <= now &&
      offer.autoActivate
    );
    
    if (offersToActivate.length > 0) {
      await offerActions.bulkOperation({
        action: 'activate',
        offerIds: offersToActivate.map(offer => offer.id)
      });
    }
  },

  // Auto-deactivate expired offers
  async autoDeactivateOffers(): Promise<void> {
    const store = useOfferStore.getState();
    const now = new Date();
    
    const offersToDeactivate = store.offers.filter(offer => 
      offer.status === OfferStatus.ACTIVE &&
      offer.endDate &&
      new Date(offer.endDate) <= now &&
      offer.autoDeactivate
    );
    
    if (offersToDeactivate.length > 0) {
      await offerActions.bulkOperation({
        action: 'update',
        offerIds: offersToDeactivate.map(offer => offer.id),
        updates: { status: OfferStatus.ENDED }
      });
    }
  },
};

/**
 * Offer Selection Actions
 */
export const offerSelectionActions = {
  // Select offers by criteria
  selectOffersByCriteria(criteria: {
    type?: OfferType;
    status?: OfferStatus;
    priority?: Priority;
    hasPerformanceData?: boolean;
    isExpiring?: boolean;
  }): void {
    const store = useOfferStore.getState();
    
    const matchingOffers = store.offers.filter(offer => {
      if (criteria.type && offer.type !== criteria.type) return false;
      if (criteria.status && offer.status !== criteria.status) return false;
      if (criteria.priority && offer.priority !== criteria.priority) return false;
      if (criteria.hasPerformanceData && !offer.performance) return false;
      
      if (criteria.isExpiring) {
        const now = new Date();
        const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        if (!offer.endDate || new Date(offer.endDate) > twentyFourHoursFromNow) return false;
      }
      
      return true;
    });
    
    matchingOffers.forEach(offer => {
      store.selectOffer(offer.id);
    });
    
    toast.success(`Selected ${matchingOffers.length} offers matching criteria`);
  },

  // Select top performing offers
  selectTopPerformingOffers(limit: number = 10): void {
    const store = useOfferStore.getState();
    const topOffers = store.getTopPerformingOffers(limit);
    
    topOffers.forEach(offer => {
      store.selectOffer(offer.id);
    });
    
    toast.success(`Selected top ${topOffers.length} performing offers`);
  },

  // Invert selection
  invertSelection(): void {
    const store = useOfferStore.getState();
    const currentSelection = new Set(store.selectedOfferIds);
    
    store.clearSelection();
    store.offers.forEach(offer => {
      if (!currentSelection.has(offer.id)) {
        store.selectOffer(offer.id);
      }
    });
    
    toast.success('Selection inverted');
  },
};

/**
 * Filter and Search Actions
 */
export const offerFilterActions = {
  // Apply quick filters
  applyQuickFilter(filterType: 'active' | 'scheduled' | 'expired' | 'draft' | 'high-priority' | 'expiring-soon'): void {
    const store = useOfferStore.getState();
    
    switch (filterType) {
      case 'active':
        store.setFilters({ status: OfferStatus.ACTIVE });
        break;
      case 'scheduled':
        store.setFilters({ status: OfferStatus.SCHEDULED });
        break;
      case 'expired':
        store.setFilters({ status: OfferStatus.ENDED });
        break;
      case 'draft':
        store.setFilters({ status: OfferStatus.DRAFT });
        break;
      case 'high-priority':
        store.setFilters({ priority: Priority.HIGH });
        break;
      case 'expiring-soon':
        store.setFilters({ isExpiring: true });
        break;
    }
  },

  // Set date range filter
  setDateRangeFilter(from: Date, to?: Date): void {
    const store = useOfferStore.getState();
    store.setFilters({ dateRange: { from, to } });
  },

  // Set performance filter
  setPerformanceFilter(minRevenue?: number, hasPerformanceData?: boolean): void {
    const store = useOfferStore.getState();
    store.setFilters({ minRevenue, hasPerformanceData });
  },

  // Save filter preset
  saveFilterPreset(name: string, filters: OfferFilters): void {
    const presets = JSON.parse(localStorage.getItem('offer-filter-presets') || '{}');
    presets[name] = filters;
    localStorage.setItem('offer-filter-presets', JSON.stringify(presets));
    toast.success(`Filter preset "${name}" saved`);
  },

  // Load filter preset
  loadFilterPreset(name: string): void {
    const presets = JSON.parse(localStorage.getItem('offer-filter-presets') || '{}');
    const preset = presets[name];
    
    if (preset) {
      const store = useOfferStore.getState();
      store.setFilters(preset);
      toast.success(`Filter preset "${name}" applied`);
    } else {
      toast.error(`Filter preset "${name}" not found`);
    }
  },
};

/**
 * Analytics Actions
 */
export const offerAnalyticsActions = {
  // Fetch offer analytics
  async fetchOfferAnalytics(offerId: string, timeframe: string = '30d') {
    try {
      const analytics = await getOfferAnalytics(offerId, timeframe);
      return analytics;
    } catch (error: any) {
      toast.error('Failed to fetch offer analytics');
      throw error;
    }
  },

  // Update offer performance
  updateOfferPerformance(offerId: string, performance: Partial<any>): void {
    const store = useOfferStore.getState();
    const offer = store.offers.find(o => o.id === offerId);
    
    if (offer && offer.performance) {
      const updatedPerformance = { ...offer.performance, ...performance };
      store.updateOffer(offerId, { performance: updatedPerformance });
    }
  },

  // Calculate performance metrics
  calculatePerformanceMetrics(): {
    totalRevenue: number;
    averageConversion: number;
    topPerformers: Offer[];
    underPerformers: Offer[];
  } {
    const store = useOfferStore.getState();
    const offersWithPerformance = store.offers.filter(offer => offer.performance);
    
    const totalRevenue = offersWithPerformance.reduce(
      (sum, offer) => sum + (offer.performance?.revenue || 0), 0
    );
    
    const averageConversion = offersWithPerformance.length > 0
      ? offersWithPerformance.reduce(
          (sum, offer) => sum + (offer.performance?.conversionRate || 0), 0
        ) / offersWithPerformance.length
      : 0;
    
    const sortedByRevenue = [...offersWithPerformance].sort(
      (a, b) => (b.performance?.revenue || 0) - (a.performance?.revenue || 0)
    );
    
    const topPerformers = sortedByRevenue.slice(0, 5);
    const underPerformers = sortedByRevenue
      .filter(offer => (offer.performance?.conversionRate || 0) < averageConversion * 0.5)
      .slice(0, 5);
    
    return {
      totalRevenue,
      averageConversion,
      topPerformers,
      underPerformers,
    };
  },
};

/**
 * Utility Actions
 */
export const offerUtilityActions = {
  // Export offers to CSV
  exportOffersToCSV(offerIds?: string[]): void {
    const store = useOfferStore.getState();
    const offersToExport = offerIds 
      ? store.offers.filter(offer => offerIds.includes(offer.id))
      : store.filteredOffers;
    
    const csvHeaders = [
      'ID', 'Title', 'Type', 'Status', 'Discount Type', 'Discount Value',
      'Start Date', 'End Date', 'Revenue', 'Conversions', 'Conversion Rate'
    ];
    
    const csvData = offersToExport.map(offer => [
      offer.id,
      offer.title,
      offer.type,
      offer.status,
      offer.discountConfig.discountType,
      offer.discountConfig.discountValue,
      offer.startDate,
      offer.endDate || '',
      offer.performance?.revenue || 0,
      offer.performance?.conversions || 0,
      offer.performance?.conversionRate || 0,
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offers-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${offersToExport.length} offers to CSV`);
  },

  // Import offers from CSV
  async importOffersFromCSV(file: File): Promise<void> {
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
      
      const offers: CreateOfferRequest[] = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.replace(/"/g, ''));
          return {
            title: values[1] || 'Imported Offer',
            type: (values[2] as OfferType) || OfferType.PROMOTIONAL,
            discountConfig: {
              discountType: values[4] as any,
              discountValue: parseFloat(values[5]) || 0,
            },
            startDate: values[6] || new Date().toISOString(),
            endDate: values[7] || undefined,
          };
        });
      
      // Create offers one by one
      let successCount = 0;
      let errorCount = 0;
      
      for (const offerData of offers) {
        try {
          await offerActions.createOffer(offerData);
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }
      
      toast.success(`Import completed: ${successCount} offers created, ${errorCount} errors`);
    } catch (error: any) {
      toast.error('Failed to import offers from CSV');
      throw error;
    }
  },

  // Validate offer data
  validateOfferData(offerData: CreateOfferRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!offerData.title.trim()) {
      errors.push('Title is required');
    }
    
    if (!offerData.type) {
      errors.push('Offer type is required');
    }
    
    if (!offerData.discountConfig.discountType) {
      errors.push('Discount type is required');
    }
    
    if (offerData.discountConfig.discountValue <= 0) {
      errors.push('Discount value must be greater than 0');
    }
    
    if (offerData.discountConfig.discountType === DiscountType.PERCENTAGE && 
        offerData.discountConfig.discountValue > 100) {
      errors.push('Percentage discount cannot exceed 100%');
    }
    
    if (!offerData.startDate) {
      errors.push('Start date is required');
    }
    
    if (offerData.endDate && new Date(offerData.endDate) <= new Date(offerData.startDate)) {
      errors.push('End date must be after start date');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Generate offer code
  generateOfferCode(length: number = 8, prefix?: string, suffix?: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return `${prefix || ''}${code}${suffix || ''}`;
  },

  // Check code availability
  async checkCodeAvailability(code: string): Promise<boolean> {
    try {
      await validateOfferCode(code);
      return true;
    } catch (error) {
      return false;
    }
  },
};

// Export all actions as a single object
export const allOfferActions = {
  ...offerActions,
  ...offerStatusActions,
  ...offerSelectionActions,
  ...offerFilterActions,
  ...offerAnalyticsActions,
  ...offerUtilityActions,
};

// Export individual action groups
export {
  offerActions,
  offerStatusActions, 
  offerSelectionActions,
  offerFilterActions,
  offerAnalyticsActions,
  offerUtilityActions,
};

// Default export
export default allOfferActions;
