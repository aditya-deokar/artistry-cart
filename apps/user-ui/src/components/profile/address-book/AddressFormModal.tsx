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

export const AddressFormModal: React.FC<AddressFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false,
  });

  // ✅ Update form when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        addressLine1: initialData.addressLine1,
        addressLine2: initialData.addressLine2 ?? '',
        city: initialData.city,
        state: initialData.state,
        postalCode: initialData.postalCode,
        country: initialData.country,
        isDefault: initialData.isDefault,
      });
    } else {
      setFormData({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        isDefault: false,
      });
    }
  }, [initialData, isOpen]);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value, type, checked } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(initialData ? { ...formData, id: initialData.id } : formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Input
            name="addressLine1"
            placeholder="Address Line 1"
            value={formData.addressLine1}
            onChange={handleChange}
            required
          />
          <Input
            name="addressLine2"
            placeholder="Address Line 2"
            value={formData.addressLine2}
            onChange={handleChange}
          />
          <Input
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            required
          />
          <Input
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            required
          />
          <Input
            name="postalCode"
            placeholder="Postal Code"
            value={formData.postalCode}
            onChange={handleChange}
            required
          />
          <Input
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            required
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
            />
            Set as default address
          </label>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Address'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
