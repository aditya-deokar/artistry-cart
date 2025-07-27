import React from 'react'
import { Controller, useFieldArray } from 'react-hook-form'
import Input from '../inputs/input'
import { Button } from '@/components/ui/button'
import { PlusCircle, Trash2 } from 'lucide-react'

const CustomSpecifications = ({control, errors} :any) => {

    const { fields, append, remove} = useFieldArray({
        control,
        name:"custom_specifications",
    })


  return (
    <div>
        <label className='block font-semibold text-primary/80 mb-1'>
            Custom Specifications
        </label>
        <div className='flex flex-col gap-3 '>
            {fields?.map((Item, index)=> (
                <div
                className='flex gap-2 items-center'
                key={index}>
                    <Controller name={`custom_specifications.${index}.name`}
                    control={control}
                    rules={{required: "Specification Name is required!"}}
                    render={({field})=>(
                        <Input
                            label='Specification Name'
                            placeholder='e.g. material, size, weight, etc.'  
                            {...field}
                        />
                    )}
                    ></Controller>


                    <Controller
                        name={`custom_specifications.${index}.value`}
                        control={control}
                        rules={{required: "Value is required!"}}
                        render={({field})=>(
                            <Input
                                label='Value'
                                placeholder='e.g. Wood, Polished, 30cm, etc.'  
                                {...field}
                            />
                        )}
                    
                    />

                    <Button type='button' 
                        variant={"destructive"}
                        onClick={ ()=> remove(index) }
                    >
                        <Trash2 size={20}/>
                    </Button>
                </div>
            ))}

            <Button 
                type='button'
                className=''
                variant={'secondary'}
                onClick={()=> append({name: "",value:""})}
            >
                <PlusCircle size={20}/>Add Specifications
            </Button>
        </div>

        {errors.brand && (
            <p className='text-red-500 text-xs mt-1'>{errors.brand?.message as string}</p>
        )}
    </div>
  )
}

export default CustomSpecifications