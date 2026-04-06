'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/blog/post.module.css';

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  containerClassName,
  containerStyle,
  imageClassName,
  imageStyle,
  priority = false,
}) {
  const [isLoading, setLoading] = useState(true);

  // Varsayılan width ve height değerleri - %50 küçük
  const imgWidth = width || 400; // 800 -> 400
  const imgHeight = height || 225; // 450 -> 225

  return (
    <div
      className={`${styles.optimizedImageContainer} ${className || ''} ${containerClassName || ''}`.trim()}
      style={containerStyle}
    >
      <Image
        src={src}
        alt={alt || "Blog görseli"}
        width={imgWidth}
        height={imgHeight}
        quality={90}
        className={`
          ${styles.optimizedImage}
          ${isLoading ? styles.optimizedImageLoading : ''}
          ${imageClassName || ''}
        `}
        style={imageStyle}
        onLoadingComplete={() => setLoading(false)}
        priority={priority}
      />
    </div>
  );
} 