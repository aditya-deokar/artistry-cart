import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit } from 'lucide-react';

export interface AddressData {
    id: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

type AddressCardProps = {
    address: AddressData;
    onEdit: (address: AddressData) => void;
    onDelete: (addressId: string) => void;
};

export const AddressCard: React.FC<AddressCardProps> = ({ address, onEdit, onDelete }) => {
    return (
        <div className="p-4 border border-neutral-800 rounded-lg flex justify-between items-start">
            <div>
                {address.isDefault && <Badge className="mb-2">Default</Badge>}
                <p className="font-semibold">{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>{address.city}, {address.state} {address.postalCode}</p>
                <p>{address.country}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => onEdit(address)}><Edit size={16} /></Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(address.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16} /></Button>
            </div>
        </div>
    );
};