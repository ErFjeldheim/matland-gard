'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CardCarouselProps {
    images: string[];
    alt: string;
}

export default function CardCarousel({ images, alt }: CardCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 4000); // Change image every 4 seconds

        return () => clearInterval(interval);
    }, [images.length]);

    if (images.length === 0) return null;

    return (
        <div className="relative h-64 w-full overflow-hidden">
            {images.map((src, index) => (
                <div
                    key={src}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <Image
                        src={src}
                        alt={`${alt} - bilde ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                    />
                </div>
            ))}

            {/* Indicator dots */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                    {images.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors duration-300 ${index === currentIndex ? 'bg-white' : 'bg-white/40'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
