import { getAllPostSlugs, getPostData } from '@/lib/posts';
import styles from './page.module.css';
import CommentSection from '../components/CommentSection';

export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths;
}

export async function generateMetadata({ params }) {
  const post = await getPostData(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      authors: [post.author],
      publishedTime: post.date,
    },
  };
}

export default async function BlogPost({ params }) {
  const post = await getPostData(params.slug);
  
  const formattedDate = new Date(post.date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={styles.container}>
      <article className={styles.article}>
        <header className={styles.header}>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.meta}>
            <span className={styles.author}>{post.author}</span>
            <time dateTime={post.date} className={styles.date}>
              {formattedDate}
            </time>
          </div>
        </header>

        <div 
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
        />
      </article>
      
      <div className={styles.divider}></div>
      
      <CommentSection slug={params.slug} />
    </div>
  );
} 