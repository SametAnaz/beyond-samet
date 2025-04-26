'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import styles from '../../../styles/blog/post.module.css';

const CustomMarkdown = dynamic(() => import('@/components/CustomMarkdown'), {
  loading: () => <div className={styles.loading}>Loading content...</div>
});

export default function PostContent({ post }) {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading content...</div>}>
      {post.content ? (
        <CustomMarkdown content={post.content} />
      ) : (
        <div 
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
        />
      )}
    </Suspense>
  );
} 