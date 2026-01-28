"use client";

import Image from "next/image";
import { useState } from "react";

interface HeroImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
}

export function HeroImage({
  src,
  alt,
  fallbackSrc = "/images/placeholder-hero.svg",
}: HeroImageProps) {
  // Try webp first, then svg, then placeholder
  const svgSrc = src.replace(".webp", ".svg");
  const [imgSrc, setImgSrc] = useState(src);
  const [errorCount, setErrorCount] = useState(0);

  const handleError = () => {
    if (errorCount === 0) {
      // First error: try SVG version
      setImgSrc(svgSrc);
      setErrorCount(1);
    } else if (errorCount === 1) {
      // Second error: use placeholder
      setImgSrc(fallbackSrc);
      setErrorCount(2);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover"
      priority
      sizes="(max-width: 1024px) 100vw, 50vw"
      onError={handleError}
    />
  );
}
