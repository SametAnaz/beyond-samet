'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import Giscus from '@giscus/react';
import styles from './CommentSection.module.css';

export default function CommentSection({ slug }) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'dark' ? 'dark_dimmed' : 'light';
  const commentSlug = slug;

  // Giscus'un URL parametresi değiştiğinde yeniden yüklenmesi için
  useEffect(() => {
    const iframe = document.querySelector('.giscus-frame');
    if (iframe) {
      iframe.src = iframe.src;
    }
  }, [commentSlug]);

  return (
    <section className={styles.comments}>
      <h2 className={styles.title}>Yorumlar</h2>
      <Giscus
        id="comments"
        repo="SametAnaz/beyond-samet"
        repoId="971767619"
        category="General"
        categoryId="44421397"
        mapping="pathname"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme}
        lang="tr"
      />
    </section>
  );
} 