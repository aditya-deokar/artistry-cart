import { Button } from '@/components/ui/button';
import { Pencil, WandSparkles, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react'
import ImageEnhancement from '../image-enchance';
import { UploadedImages } from '@/app/(routes)/dashboard/create-product/page';

type Props = { 
    size: string, 
    small?:boolean, 
    onImageChange:(file: File | null, index:number) => void, 
    onRemove:(index: number)=> void, 
    defaultImage?: string | null, 
    index: any, 
    setOpenImageModal: (openImageModal: boolean)=> void
    setSelectedImage: (e:string)=> void
    selectedImage : string
    image: (UploadedImages | null)[]
}


const ImagePlaceholder = ({ size, small, onImageChange, onRemove, defaultImage = null, index = null, setOpenImageModal ,setSelectedImage,selectedImage,  image }: Props) => {


    const [imagePreview, setImagePreview] = useState<string| null>(defaultImage);

    const handleFileChange =(event: React.ChangeEvent<HTMLInputElement>)=>{
        const file= event.target.files?.[0];
        if(file){
            setImagePreview(URL.createObjectURL(file));
            onImageChange(file, index!);

        }
    }



    return (
        <div className={`relative ${small ? 'h-[180px]' : 'h-[450px]' } w-full cursor-pointer bg-secondary border rounded-lg flex flex-col justify-center items-center `}>
            <input type="file"
            accept='image/*'
            className='hidden'
            id={`image-upload-${index}`}
            onChange={handleFileChange}
            />
            {
                imagePreview ? (
                    <>
                    <Button
                    type='button'
                    className='absolute top-3 right-3 p-2 !rounded shadow-lg hover:cursor-pointer'
                     onClick={()=> onRemove?.(index!)} variant={'destructive'}>
                        <X size={16}/>
                    </Button>
                    <ImageEnhancement selectedImage={selectedImage} index={index} image={image} setSelectedImage={setSelectedImage}  />
                    </>
                ):(
                    <label htmlFor={`image-upload-${index}`} className='absolute top-3 right-3 p-2 rounded bg-secondary/40 shadow-lg cursor-pointer'>
                        <Pencil size={16}/>
                    </label>
                )
            }
            
            {
                imagePreview ? (
                    <Image src={imagePreview}
                    alt='uploaded'
                    width={400}
                    height={300}
                    className='w-full h-full object-cover rounded-lg'
                    />
                ):(
                    <>
                    <p className={`text-primary/50 ${small ? "text-xl" : "text-4xl"} font-semibold`}>{size}</p>
                    <p className={`text-primary/50 ${small ? 'text-sm' : 'text-lg'} pt-2 text-center`}>Please choose an image <br />
                    according to the expected ratio
                    </p>
                    </>
                )
            }
        </div>
    )
}

export default ImagePlaceholder