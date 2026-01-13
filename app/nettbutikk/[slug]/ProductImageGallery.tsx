'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  mainImage: string;
  additionalImages: string[];
  productName: string;
}

export default function ProductImageGallery({ mainImage, additionalImages, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(mainImage);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div
          className="relative h-96 bg-gray-200 rounded-lg overflow-hidden cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
        >
          <Image
            src={selectedImage}
            alt={productName}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Thumbnail Grid */}
        {additionalImages.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            {additionalImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`relative h-24 bg-gray-200 rounded-lg overflow-hidden cursor-pointer transition-all ${selectedImage === img ? 'opacity-60' : 'hover:opacity-80 hover:scale-105'
                  }`}
              >
                <Image
                  src={img}
                  alt={`${productName} ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors cursor-pointer"
            onClick={() => setIsLightboxOpen(false)}
          >
            ×
          </button>
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full">
            <Image
              src={selectedImage}
              alt={productName}
              fill
              className="object-contain"
              quality={100}
            />
          </div>
        </div>
      )}
    </>
  );
}
