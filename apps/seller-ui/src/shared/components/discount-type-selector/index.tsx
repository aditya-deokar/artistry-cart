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
  name: string
  label?: string
}

const DiscountTypeSelector = ({
  control,
  name,
  label = "Discount Type"
}: DiscountTypeSelectorProps) => {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Controller
        control={control}
        name={name}
        rules={{ required: "Discount type is required" }}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Discount Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="flat">Flat Amount</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </div>
  )
}

export default DiscountTypeSelector
