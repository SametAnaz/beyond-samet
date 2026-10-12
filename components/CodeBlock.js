'use client';
import { useState, Children, isValidElement, cloneElement } from 'react';
import styles from '@/styles/blog/post.module.css';
function text(node) { return node.type === 'text' ? node.value : (node.children || []).map(text).join(''); }
export default function CodeBlock({ node, children, ...props }) {
  const [status, setStatus] = useState('Kopyala');
  const codeNode = node.children.find(child => child.tagName === 'code');
  const language = /language-(\S+)/.exec(codeNode?.properties?.className?.join(' ') || '')?.[1];
  const copy = async () => {
    try { await navigator.clipboard.writeText(text(codeNode || node)); setStatus('Kopyalandı'); }
    catch { setStatus('Kopyalanamadı'); }
  };
  return <div className={styles.codeContainer}>
    <div className={styles.codeHeader}><span>{language || 'Kod'}</span><button type="button" className={styles.copyButton} onClick={copy} aria-live="polite">{status}</button></div>
    <pre className={styles.pre} {...props}>{Children.map(children, child => isValidElement(child) ? cloneElement(child, { isBlock: true }) : child)}</pre>
  </div>;
}
