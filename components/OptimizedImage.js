'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/blog/post.module.css';

export default function OptimizedImage({ src, alt, width, height, className }) {
  const [isLoading, setLoading] = useState(true);

  // Varsayılan width ve height değerleri - %50 küçük
  const imgWidth = width || 400; // 800 -> 400
  const imgHeight = height || 225; // 450 -> 225

  return (
    <div className={`${styles.optimizedImageContainer} ${className || ''}`}>
      <Image
        src={src}
        alt={alt || "Blog görseli"}
        width={imgWidth}
        height={imgHeight}
        quality={90}
        className={`
          ${styles.optimizedImage}
          ${isLoading ? styles.optimizedImageLoading : ''}
        `}
        onLoadingComplete={() => setLoading(false)}
        priority={false}
      />
    </div>
  );
} 