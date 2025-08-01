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
  discount,
  name,
  label = "Discount"
}: DiscountTypeSelectorProps) => {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Controller
        control={control}
        name={name}
        rules={{ required: "Discount is required" }}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Discount" />
            </SelectTrigger>
            <SelectContent>
              {discount.map((disc:any,index:number)=>(
                <SelectItem key={index} value={disc.id}>{disc.publicName} {" "}  ({disc.discountValue} {disc.discountType === "percentage" ? "%" : " Rupees"} ) </SelectItem>
              ))}
              
             
            </SelectContent>
          </Select>
        )}
      />
    </div>
  )
}

export default DiscountSelector
