'use client'

import { Controller, Control } from 'react-hook-form'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

type DiscountTypeSelectorProps = {
  control: Control<any>
  discount: any
  label?: string
  name: string
}

const DiscountSelector = ({
  control,
  discount = [], // Default to empty array
  name,
  label = "Discount"
}: DiscountTypeSelectorProps) => {
  // Ensure discount is always an array
  const discountArray = Array.isArray(discount) ? discount : [];

  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={discountArray.length === 0 ? "No discounts available" : "Select Discount"} />
            </SelectTrigger>
            <SelectContent>
              {discountArray.length === 0 ? (
                <SelectItem value="none" disabled>No discounts available</SelectItem>
              ) : (
                discountArray.map((disc: any, index: number) => (
                  <SelectItem key={disc.id || index} value={disc.id}>
                    {disc.publicName} ({disc.discountValue} {disc.discountType === "PERCENTAGE" ? "%" : "₹"})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  )
}

export default DiscountSelector
