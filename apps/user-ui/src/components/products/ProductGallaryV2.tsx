"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageInfo } from "@/types/products";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"; 

// Icons
const PlayIcon = () => (
  <svg
    className="w-8 h-8 text-white"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
      clipRule="evenodd"
    />
  </svg>
);

type ProductGalleryProps = {
  productTitle: string;
  images: ImageInfo[];
  videoUrl?: string | null;
};

export const ProductGalleryV2: React.FC<ProductGalleryProps> = ({
  productTitle,
  images,
  videoUrl,
}) => {
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full bg-neutral-800 rounded-lg animate-pulse"></div>
    );
  }

  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4 items-start">
        {/* Vertical Thumbnails */}
        <div className="flex md:flex-col gap-3 order-2 md:order-1">
          {images.map((image, index) => (
            <button
              key={image.file_id}
              onClick={() => setSelectedImage(image)}
              className={cn(
                "relative aspect-square w-full rounded-md overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background",
                selectedImage.file_id === image.file_id
                  ? "ring-2 ring-accent"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="10vw"
                className="object-cover"
              />
            </button>
          ))}

          {videoUrl && (
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="relative aspect-square w-full rounded-md overflow-hidden bg-neutral-900 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                  aria-label="Play product video"
                >
                  <PlayIcon />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-neutral-900 p-0 overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    src={videoUrl?.replace(
                      "youtu.be/",
                      "youtube.com/embed/"
                    )}
                    title="Product Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Main Image */}
        <div className="relative aspect-square w-full  group order-1 md:order-2">
            
          <Image
            src={selectedImage.url}
            alt={`Main image of ${productTitle}`}
            width={800}
            height={800}
            priority
            className="object-cover w-full h-full rounded-t-lg transition-opacity duration-300"
          />

          <Image
                      src={selectedImage.url}
                      alt={`${productTitle} reflection`}
                      width={600}
                      height={600}
                      priority // Prioritize loading the main visible image
                      className="absolute top-[95%] -scale-y-100 opacity-20 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0)_50%,rgba(0,0,0,1)_100%)] pointer-events-none"
                    />
        </div>
      </div>
    </>
  );
};
