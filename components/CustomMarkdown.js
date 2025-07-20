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
    img: ({ node, src, alt, ...props }) => {
      return (
        <OptimizedImage 
          src={src} 
          alt={alt || ''} 
          {...props} 
        />
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