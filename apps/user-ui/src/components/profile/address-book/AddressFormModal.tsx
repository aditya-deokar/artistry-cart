import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddressData } from './AddressCard';

type AddressFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (address: Omit<AddressData, 'id'> | AddressData) => void;
  isPending: boolean;
  initialData?: AddressData | null;
};

export const AddressFormModal: React.FC<AddressFormModalProps> = ({ isOpen, onClose, onSubmit, isPending, initialData }) => {
  const [formData, setFormData] = useState({
    addressLine1: '', city: '', state: '', postalCode: '', country: '', isDefault: false
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ addressLine1: '', city: '', state: '', postalCode: '', country: '', isDefault: false });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(initialData ? { ...formData, id: initialData.id } : formData);
  };
  
  // ... (Input change handler)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Address' : 'Add New Address'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Form fields for addressLine1, city, state, etc. */}
          <Input name="addressLine1" placeholder="Address Line 1" value={formData.addressLine1} required />
          <Input name="city" placeholder="City" value={formData.city} required />
          {/* ... other inputs */}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Address'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};