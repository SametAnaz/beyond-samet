'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import 'highlight.js/styles/night-owl.css';
import styles from '@/styles/blog/post.module.css';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';

const IMAGE_SIZE_MAP = {
  sm: { width: 320, height: 180 },
  md: { width: 520, height: 293 },
  lg: { width: 760, height: 428 },
  xl: { width: 960, height: 540 },
  full: { width: 1200, height: 675 },
};

function parseImageTitle(title) {
  if (!title) {
    return {};
  }

  if (!title.includes('=')) {
    return { caption: title };
  }

  return title.split('|').reduce((accumulator, part) => {
    const [rawKey, ...rawValueParts] = part.split('=');
    const key = rawKey?.trim();
    const rawValue = rawValueParts.join('=').trim();

    if (!key || !rawValue) {
      return accumulator;
    }

    const value = decodeURIComponent(rawValue.replace(/\+/g, '%20'));
    accumulator[key] = value;
    return accumulator;
  }, {});
}

function getImagePresentation(widthValue) {
  if (!widthValue) {
    return {
      width: IMAGE_SIZE_MAP.md.width,
      height: IMAGE_SIZE_MAP.md.height,
      containerStyle: undefined,
    };
  }

  const normalizedWidth = String(widthValue).trim();

  if (normalizedWidth.endsWith('%')) {
    const percent = Number.parseFloat(normalizedWidth);
    const fallbackWidth = IMAGE_SIZE_MAP.md.width;
    const computedWidth = Number.isFinite(percent) && percent > 0
      ? Math.round((fallbackWidth * percent) / 100)
      : fallbackWidth;

    return {
      width: computedWidth,
      height: Math.round(computedWidth * 0.5625),
      containerStyle: {
        width: normalizedWidth,
        maxWidth: '100%',
      },
    };
  }

  const parsedWidth = Number.parseInt(normalizedWidth, 10);

  if (Number.isFinite(parsedWidth) && parsedWidth > 0) {
    return {
      width: parsedWidth,
      height: Math.round(parsedWidth * 0.5625),
      containerStyle: {
        width: `${parsedWidth}px`,
        maxWidth: '100%',
      },
    };
  }

  return {
    width: IMAGE_SIZE_MAP.md.width,
    height: IMAGE_SIZE_MAP.md.height,
    containerStyle: undefined,
  };
}

const CustomMarkdown = ({ content }) => {
  // Özel bileşenler
  const customComponents = {
    // Başlıklar için özel bileşen
    h1: ({ node, ...props }) => <h1 className={styles.heading} {...props} />,
    h2: ({ node, ...props }) => <h2 className={styles.heading} {...props} />,
    h3: ({ node, ...props }) => <h3 className={styles.heading} {...props} />,
    h4: ({ node, ...props }) => <h4 className={styles.heading} {...props} />,
    h5: ({ node, ...props }) => <h5 className={styles.heading} {...props} />,
    h6: ({ node, ...props }) => <h6 className={styles.heading} {...props} />,

    // Image'lar için özel bileşen - block element olarak render et
    img: ({ node, src, alt, title, ...props }) => {
      const metadata = parseImageTitle(title);
      const align = metadata.align || 'center';
      const dimensions = getImagePresentation(metadata.width);
      const caption = metadata.caption || '';
      const containerStyle = {
        ...(dimensions.containerStyle || {}),
        margin: align === 'left'
          ? '0 auto 0 0'
          : align === 'right'
            ? '0 0 0 auto'
            : '0 auto',
      };

      return (
        <figure className={styles.markdownFigure}>
          <OptimizedImage
            src={src}
            alt={alt || caption || ''}
            width={dimensions.width}
            height={dimensions.height}
            containerClassName={styles.markdownFigureImage}
            containerStyle={containerStyle}
            imageClassName={styles.markdownFigureImageElement}
            {...props}
          />
          {caption && <figcaption className={styles.markdownFigureCaption}>{caption}</figcaption>}
        </figure>
      );
    },

    // Paragraflar için özel bileşen
    p: ({ node, ...props }) => <p className={styles.paragraph} {...props} />,

    // Linkler için özel bileşen
    a: ({ node, ...props }) => {
      const href = props.href || '#';
      // Check if it's an external link
      const isExternal = href.startsWith('http') && !href.includes(process.env.NEXT_PUBLIC_SITE_URL);
      
      return isExternal ? (
        <a 
          href={href} 
          className={styles.link} 
          target="_blank" 
          rel="noopener noreferrer" 
          {...props} 
        />
      ) : (
        <Link href={href} className={styles.link} {...props} />
      );
    },

    // Listeler için özel bileşen
    ul: ({ node, ...props }) => <ul className={styles.list} {...props} />,
    ol: ({ node, ...props }) => <ol className={styles.list} {...props} />,
    li: ({ node, ...props }) => <li className={styles.listItem} {...props} />,

    // Blockquote için özel bileşen
    blockquote: ({ node, ...props }) => (
      <blockquote className={styles.blockquote} {...props} />
    ),

    // Kod blokları için özel bileşen
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <div className={styles.codeContainer}>
          {match && (
            <div className={styles.codeHeader}>
              <span>{match[1]}</span>
            </div>
          )}
          <pre className={styles.pre}>
            <code className={`${className} ${styles.code}`} {...props}>
              {children}
            </code>
          </pre>
        </div>
      ) : (
        <code className={styles.inlineCode} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className={styles.markdownContent}>
      <ReactMarkdown
        components={customComponents}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeUnwrapImages]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default CustomMarkdown; 