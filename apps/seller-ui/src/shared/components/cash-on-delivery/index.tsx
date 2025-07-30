'use client'

import { Controller, Control } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

type Props = {
  control: Control<any>
  name: string
  label?: string
  className?: string
}

const CashOnDeliverySelector = ({ control, name, label = 'Cash on Delivery Available?', className }: Props) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-base font-medium">{label}</Label>
      <Controller
        control={control}
        name={name}
        rules={{ required: true }}
        render={({ field }) => (
          <RadioGroup
            onValueChange={(val) => field.onChange(val === 'yes')}
            value={field.value ? 'yes' : 'no'}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="cod-yes" />
              <Label htmlFor="cod-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="cod-no" />
              <Label htmlFor="cod-no">No</Label>
            </div>
          </RadioGroup>
        )}
      />
    </div>
  )
}

export default CashOnDeliverySelector
