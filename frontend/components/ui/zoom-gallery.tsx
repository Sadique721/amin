'use client';

import * as React from 'react';
import Image from 'next/image';

interface ZoomGalleryProps {
  images: string[];
}

export function ZoomGallery({ images }: ZoomGalleryProps) {
  const [activeImage, setActiveImage] = React.useState(images[0] || '/images/placeholder.jpg');
  const [zoomStyle, setZoomStyle] = React.useState<React.CSSProperties>({ display: 'none' });

  React.useEffect(() => {
    if (images.length > 0) {
      setActiveImage(images[0]);
    }
  }, [images]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  return (
    <div className="flex flex-col gap-4">
      
      <div
        className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted/10 cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={activeImage}
          alt="Product details preview"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        <div
          className="absolute inset-0 pointer-events-none hidden md:block"
          style={zoomStyle}
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                activeImage === img ? 'border-amber-500 scale-95 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail preview ${idx}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
