'use client'

import { Controller, Control, useWatch } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

type SizeSelectorProps = {
  control: Control<any>
  name: string
  sizes: string[]
  label?: string
  className?: string
}

const SizeSelector = ({ control, name, sizes, label = 'Select Sizes', className }: SizeSelectorProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-base font-medium">{label}</Label>
      <Controller
        control={control}
        name={name}
        rules={{ required: true }}
        render={({ field }) => {
          const selectedSizes = field.value || []

          const handleToggle = (size: string) => {
            if (selectedSizes.includes(size)) {
              field.onChange(selectedSizes.filter((s: string) => s !== size))
            } else {
              field.onChange([...selectedSizes, size])
            }
          }

          return (
            <div className="flex flex-wrap gap-4">
              {sizes.map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={size}
                    checked={selectedSizes.includes(size)}
                    onCheckedChange={() => handleToggle(size)}
                  />
                  <Label htmlFor={size}>{size}</Label>
                </div>
              ))}
            </div>
          )
        }}
      />
    </div>
  )
}

export default SizeSelector
