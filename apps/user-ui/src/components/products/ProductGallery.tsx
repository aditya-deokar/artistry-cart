'use client';

import { useState } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils'; // Assuming you have a utility for classnames
import { ImageInfo } from '@/types/products';

type ProductGalleryProps = {
  productTitle: string;
  images: ImageInfo[];
};

export const ProductGallery: React.FC<ProductGalleryProps> = ({ productTitle, images }) => {
  // If there are no images, return a placeholder to prevent crashes
  if (!images || images.length === 0) {
    return <div className="aspect-square w-full bg-neutral-800 rounded-lg"></div>;
  }
  
  // Set the first image as the default selected image
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Display Area with Reflection */}
      <div className="relative flex justify-center">
        {/* The reflection image. It mirrors the currently selected main image. */}
        <Image
          src={selectedImage.url}
          alt={`${productTitle} reflection`}
          width={600}
          height={600}
          priority // Prioritize loading the main visible image
          className="absolute top-[95%] -scale-y-100 opacity-20 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0)_50%,rgba(0,0,0,1)_100%)] pointer-events-none"
        />
        {/* The main product image */}
        <Image
          src={selectedImage.url}
          alt={`Main image of ${productTitle}`}
          width={600}
          height={600}
          priority
          className="relative object-cover aspect-square rounded-lg transition-opacity duration-300"
        />
      </div>

      {/* Thumbnails Selection Area */}
      <div className="grid grid-cols-5 gap-3">
        {images.map((image, id) => (
          <button
            key={id}
            onClick={() => setSelectedImage(image)}
            className={cn(
              "relative aspect-square w-full rounded-md overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
              // Apply a visual indicator to the selected thumbnail
              selectedImage.file_id === image.file_id
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "opacity-70 hover:opacity-100"
            )}
            aria-label={`View image ${images.indexOf(image) + 1} of ${productTitle}`}
          >
            <Image
              src={image.url}
              alt={`Thumbnail of ${productTitle}`}
              fill
              sizes="(max-width: 640px) 20vw, 10vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};