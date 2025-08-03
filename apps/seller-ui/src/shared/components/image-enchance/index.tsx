import React, { useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Wand, WandSparkles } from 'lucide-react'
import { UploadedImages } from '@/app/(routes)/dashboard/create-product/page'
import Image from 'next/image'
import { enhancement } from '@/utils/ai.imageenhancement'
import { toast } from 'sonner'
type Props = {
    setSelectedImage: (e: string) => void,
    image: (UploadedImages | null)[],
    index: any,
    selectedImage: string
}

const ImageEnhancement = ({ setSelectedImage, selectedImage, image, index }: Props) => {

    const closeRef = useRef<HTMLButtonElement>(null);
    const [activeEffect, setActiveEffect] = useState('')
    const [processing, setProcessing] = useState(false)

    const applyTransformation=async(transformation : string)=>{
        if(!selectedImage || processing ) return 

        setProcessing(true);
        setActiveEffect(transformation);

        try {
            const transfromedUrl = `${selectedImage}?tr=${transformation}`

            setSelectedImage(transfromedUrl)
        } catch (error) {
            toast.error("Image not able to process!")
            console.log(error);
        } finally{
            setProcessing(false);
        }

    }
    // console.log(image);
    return (
        <Dialog>
            
                <DialogTrigger asChild>
                    <Button variant={'outline'}
                        type='button'
                        onClick={() => {
                            setSelectedImage(image[index]?.url!)
                        }}

                        className='absolute top-3 right-[70px] p-2 !rounded shadow-lg'>
                        <WandSparkles />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogTitle>Image Enhancement</DialogTitle>

                    <Image
                        src={selectedImage}
                        alt='image'
                        width={400}
                        height={300}
                    // objectFit='contain'
                    />




                    <DialogFooter>
                        {selectedImage && (
                            <div className="grid gap-4 grid-cols-2">
                                

                                    {enhancement?.map(({ label, effect})=> (
                                        <Button 
                                        key={effect}    
                                        variant={'outline'}
                                        onClick={()=> applyTransformation(effect)}
                                        disabled= {processing}
                                        // type='button'
                                        className={`p-2 w-full !rounded shadow-lg ${activeEffect == effect ? '!bg-amber-400' : '' } `}>
                                            <Wand size={18}
                                             />
                                             {label}
                                             
                                        </Button>
                                    ))}

                                    

                             
                            </div>




                        )}

                    </DialogFooter>



                </DialogContent>
            
        </Dialog>
    )
}

export default ImageEnhancement