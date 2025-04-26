'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/night-owl.css';
import styles from '@/styles/blog/post.module.css';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';

const CustomMarkdown = ({ content }) => {
  // Özel bileşenler
  const customComponents = {
    // Görseller için özel bileşen
    img: ({ node, ...props }) => {
      // Check if image has optimization attributes
      if (props['data-optimized'] === 'true') {
        return (
          <OptimizedImage
            src={props.src}
            alt={props.alt || ''}
            width={parseInt(props['data-width'], 10) || 800}
            height={parseInt(props['data-height'], 10) || 450}
          />
        );
      }
      
      // Regular image
      return (
        <OptimizedImage
          src={props.src}
          alt={props.alt || ''}
          width={800}
          height={450}
        />
      );
    },
    
    // HTML div'lerinden data-optimized-image özniteliğine sahip olanları ayrıca işle
    div: ({ node, ...props }) => {
      if (props['data-optimized-image'] === 'true') {
        return (
          <OptimizedImage
            src={props['data-src']}
            alt={props['data-alt'] || ''}
            width={parseInt(props['data-width'], 10) || 800}
            height={parseInt(props['data-height'], 10) || 450}
          />
        );
      }
      return <div {...props} />;
    },

    // Başlıklar için özel bileşen
    h1: ({ node, ...props }) => <h1 className={styles.heading} {...props} />,
    h2: ({ node, ...props }) => <h2 className={styles.heading} {...props} />,
    h3: ({ node, ...props }) => <h3 className={styles.heading} {...props} />,
    h4: ({ node, ...props }) => <h4 className={styles.heading} {...props} />,
    h5: ({ node, ...props }) => <h5 className={styles.heading} {...props} />,
    h6: ({ node, ...props }) => <h6 className={styles.heading} {...props} />,

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
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default CustomMarkdown; 