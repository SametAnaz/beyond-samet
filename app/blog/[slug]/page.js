import { getAllPostSlugs, getPostData } from '@/lib/firebase-posts';
import styles from './page.module.css';
import CommentSection from '../components/CommentSection';

export const revalidate = 3600; // Her saat verileri yeniden çek

export async function generateStaticParams() {
  const paths = await getAllPostSlugs();
  return paths;
}

export async function generateMetadata({ params }) {
  const slug = params?.slug;
  
  try {
    const post = await getPostData(slug);
    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: 'article',
        authors: [post.author],
        publishedTime: post.date instanceof Date ? post.date.toISOString() : new Date(post.date).toISOString(),
      },
    };
  } catch (error) {
    return {
      title: 'Blog Yazısı Bulunamadı',
      description: 'Aradığınız blog yazısı bulunamadı veya kaldırılmış olabilir.'
    };
  }
}

export default async function BlogPost(props) {
  const slug = props.params?.slug;
  
  try {
    const post = await getPostData(slug);
    
    const formattedDate = post.date instanceof Date
      ? post.date.toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : new Date(post.date).toLocaleDateString('tr-TR', {
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
              <time dateTime={post.date instanceof Date ? post.date.toISOString() : new Date(post.date).toISOString()} className={styles.date}>
                {formattedDate}
              </time>
            </div>
          </header>

          <div 
            className={styles.content}
            dangerouslySetInnerHTML={{ 
              __html: typeof post.contentHtml === 'string' ? post.contentHtml : '' 
            }} 
          />
        </article>
        
        <div className={styles.divider}></div>
        
        <CommentSection slug={slug} />
      </div>
    );
  } catch (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h1>Blog Yazısı Bulunamadı</h1>
          <p>Aradığınız blog yazısı bulunamadı veya kaldırılmış olabilir.</p>
        </div>
      </div>
    );
  }
} 