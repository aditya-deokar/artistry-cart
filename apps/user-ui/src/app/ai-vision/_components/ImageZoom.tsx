'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ZoomIn } from 'lucide-react';

interface ImageZoomProps {
    src: string;
    alt: string;
    trigger?: React.ReactNode;
}

export default function ImageZoom({ src, alt, trigger }: ImageZoomProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <div className="relative aspect-video cursor-pointer group">
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 overflow-hidden">
                <div className="relative w-full h-full min-h-[400px] max-h-[90vh]">
                    <Image
                        src={src}
                        alt={alt}
                        width={1920}
                        height={1080}
                        className="object-contain w-full h-full"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
