import React, { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'
import Input from '../inputs/input'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'

const CustomProperties = ({control, errors} :any) => {

    const [properties, setProperties] = useState<{label:string , values:string[]}[]>([]);
    const [newLabel, setNewLabel] = useState("");
    const [newValue, setNewValue] = useState("");



  return (
    <div>
        
        <div className='flex flex-col gap-3 '>
           
                
                    <Controller name='customProperties'
                        control={control}
                        render={({field})=>{
                            useEffect(() => {
                            field.onChange(properties)
                            }, [properties]);

                            const addProperty =()=>{
                                if(!newLabel.trim()) return;

                                setProperties([...properties, { label: newLabel, values: [] }])
                                setNewLabel("");
                            };

                            const addValue=(index: number)=>{
                                if(!newValue.trim()) return;

                                const updatedProperties = [...properties];
                                updatedProperties[index].values.push(newValue);
                                setProperties(updatedProperties);
                                setNewValue("");
                            }
                            
                            const removeProperty = (index:number)=>{
                                setProperties(properties.filter((_, i)=> i !== index))
                            }
                        return (
                            <div className='mt-2'>
                                <label className='block font-semibold mb-1 text-primary/80'>
                                    Custom Properties
                                </label>

                                <div className='flex flex-col gap-3'>
                                    {/* Existing Properties */}

                                    {properties.map((p,i)=>(
                                        <div key={i}
                                        className='border p-3 rounded-lg bg-secondary'
                                        >
                                            <div className='flex items-center justify-between'>
                                                <span className='font-medium'>
                                                    {p.label}
                                                </span>

                                                <Button type='button'
                                                onClick={()=> removeProperty(i)}
                                                variant={'destructive'}
                                                >
                                                    <X size={18} />
                                                </Button>
                                            </div>

                                            {/* Add values to Properties */}
                                            <div className='flex items-center mt-2 gap-2'>
                                                <Input placeholder='Enter value..'
                                                type='text'
                                                onChange={(e:any)=> setNewValue(e.target.value)}
                                                />

                                                <Button type='button'
                                                variant={"outline"}
                                                onClick={()=> addValue(i)}
                                                >Add</Button>
                                            </div>

                                            {/* Show values */}
                                            <div className='flex flex-wrap gap-2 mt-2'>
                                                {p?.values?.map((value ,i)=>(
                                                    <span key={i} 
                                                    className='px-2 py-1 bg-primary/20 rounded-md '
                                                    >{value}</span>
                                                ))}
                                            </div>

                                        </div>
                                    ))}

                                    {/* add New Property */}
                                    <div className='flex items-center gap-2 mt-1'>
                                        <Input placeholder='Enter Property label (e.g, Material, Warranty)'
                                        value={newLabel}
                                        type='text'
                                        onChange={(e:any)=> setNewLabel(e.target.value)}
                                        ></Input>

                                        <Button
                                            type='button'
                                            variant={"outline"}
                                            onClick={addProperty}
                                        >
                                            <Plus size={16} />Add</Button>
                                    </div>


                                </div>

                                {errors.customProperties && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.brand?.message as string}</p>
                                )}
                            </div>
                        )
                        }}
                    />
        </div>
    </div>
  )
}

export default CustomProperties