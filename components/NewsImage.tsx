"use client";

import { useEffect, useState } from "react";

type NewsImageProps = {
  src: string;
  alt?: string;
  width: number;
  height: number;
  priority?: boolean;
};

const fallbackImage = "/images/mine-survey.jpg";

export function NewsImage({ src, alt = "", width, height, priority = false }: NewsImageProps) {
  const [imageSrc, setImageSrc] = useState(src || fallbackImage);

  useEffect(() => {
    setImageSrc(src || fallbackImage);
  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => {
        if (imageSrc !== fallbackImage) {
          setImageSrc(fallbackImage);
        }
      }}
    />
  );
}
