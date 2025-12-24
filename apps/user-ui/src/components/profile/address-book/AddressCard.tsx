'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, MapPin, Star } from 'lucide-react';
import { gsap } from 'gsap';

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
    const cardRef = useRef<HTMLDivElement>(null);
    const editRef = useRef<HTMLButtonElement>(null);
    const deleteRef = useRef<HTMLButtonElement>(null);

    const handleMouseEnter = () => {
        if (cardRef.current) {
            gsap.to(cardRef.current, {
                y: -2,
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                borderColor: address.isDefault ? 'var(--ac-gold)' : 'var(--ac-linen)',
                duration: 0.3,
                ease: 'power2.out',
            });
        }
    };

    const handleMouseLeave = () => {
        if (cardRef.current) {
            gsap.to(cardRef.current, {
                y: 0,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                borderColor: address.isDefault ? 'var(--ac-gold)' : 'var(--ac-linen)',
                duration: 0.3,
                ease: 'power2.out',
            });
        }
    };

    // Button hover animations
    const handleButtonEnter = (ref: React.RefObject<HTMLButtonElement | null>, color: string) => {
        if (ref.current) {
            gsap.to(ref.current, {
                scale: 1.1,
                color: color,
                duration: 0.2,
                ease: 'back.out(2)',
            });
        }
    };

    const handleButtonLeave = (ref: React.RefObject<HTMLButtonElement | null>) => {
        if (ref.current) {
            gsap.to(ref.current, {
                scale: 1,
                color: 'var(--ac-stone)',
                duration: 0.2,
                ease: 'power2.out',
            });
        }
    };

    return (
        <div
            ref={cardRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative p-5 md:p-6 border rounded-xl bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] transition-colors duration-300 group overflow-hidden ${address.isDefault
                    ? 'border-[var(--ac-gold)]'
                    : 'border-[var(--ac-linen)] dark:border-[var(--ac-slate)]'
                }`}
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}
        >
            {/* Default indicator accent */}
            {address.isDefault && (
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-[var(--ac-gold)]" />
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-4">
                {/* Address Info */}
                <div className="flex items-start gap-4">
                    {/* Map icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${address.isDefault
                            ? 'bg-[var(--ac-gold)]/10'
                            : 'bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]'
                        }`}>
                        <MapPin
                            size={18}
                            className={address.isDefault ? 'text-[var(--ac-gold)]' : 'text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]'}
                        />
                    </div>

                    {/* Address details */}
                    <div className="space-y-1">
                        {/* Default badge */}
                        {address.isDefault && (
                            <Badge className="mb-2 bg-[var(--ac-gold)]/10 text-[var(--ac-gold)] border border-[var(--ac-gold)]/20 px-2.5 py-0.5 text-xs font-medium">
                                <Star size={12} className="mr-1 fill-current" />
                                Default Address
                            </Badge>
                        )}

                        <p className="font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                            {address.addressLine1}
                        </p>
                        {address.addressLine2 && (
                            <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] text-sm">
                                {address.addressLine2}
                            </p>
                        )}
                        <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] text-sm">
                            {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p className="text-[var(--ac-stone)] dark:text-[var(--ac-ash)] text-sm">
                            {address.country}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-start gap-2 flex-shrink-0 sm:self-center">
                    <Button
                        ref={editRef}
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(address)}
                        onMouseEnter={() => handleButtonEnter(editRef, 'var(--ac-gold)')}
                        onMouseLeave={() => handleButtonLeave(editRef)}
                        className="text-[var(--ac-stone)] hover:bg-[var(--ac-gold)]/10 transition-colors"
                        aria-label="Edit address"
                    >
                        <Edit size={18} />
                    </Button>
                    <Button
                        ref={deleteRef}
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(address.id)}
                        onMouseEnter={() => handleButtonEnter(deleteRef, 'var(--ac-error)')}
                        onMouseLeave={() => handleButtonLeave(deleteRef)}
                        className="text-[var(--ac-stone)] hover:bg-[var(--ac-error)]/10 transition-colors"
                        aria-label="Delete address"
                    >
                        <Trash2 size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};