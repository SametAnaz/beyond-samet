'use client';
import { useEffect, useRef, useState } from 'react';
import CustomMarkdown from '@/components/CustomMarkdown';
import styles from '@/styles/blog/post.module.css';
export default function PostContent({ post }) {
  const root = useRef(null);
  const [headings, setHeadings] = useState([]);
  useEffect(() => {
    setHeadings([...root.current.querySelectorAll('h2[id], h3[id]')].map(heading => ({ id: heading.id, text: heading.textContent, level: heading.tagName })));
  }, [post.content]);
  return <div ref={root}>
    {headings.length > 1 && <nav aria-label="İçindekiler" className={styles.tableOfContents}><h2>Bu yazıda</h2><ol>{headings.map(heading => <li key={heading.id} className={heading.level === 'H3' ? styles.subheadingLink : undefined}><a href={`#${heading.id}`}>{heading.text}</a></li>)}</ol></nav>}
    <CustomMarkdown content={post.content || ''} />
  </div>;
}
