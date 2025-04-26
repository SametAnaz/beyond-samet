import { getAllPostSlugs, getPostData } from '@/lib/firebase-posts';
import styles from '../../../styles/blog/post.module.css';
import CommentSection from '../components/CommentSection';
import PostContent from '../components/PostContent';

export const revalidate = 1800; // Her 30 dakikada verileri yeniden çek

export async function generateStaticParams() {
  const paths = await getAllPostSlugs();
  return paths;
}

export async function generateMetadata({ params }) {
  // In Next.js 15, params may be wrapped in a promise
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  
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

// Serialize Firestore data to ensure it's safe to pass to client components
function serializePost(post) {
  return {
    slug: post.slug,
    title: post.title,
    author: post.author,
    content: post.content || '',
    contentHtml: post.contentHtml || '',
    excerpt: post.excerpt || '',
    // Convert date objects to ISO strings
    date: post.date instanceof Date ? post.date.toISOString() : 
          new Date(post.date).toISOString(),
    // Convert updatedAt Timestamp to ISO string if it exists
    updatedAt: post.updatedAt ? 
               new Date(post.updatedAt.seconds * 1000).toISOString() : 
               new Date().toISOString()
  };
}

// Main blog post component (Server Component)
export default async function BlogPost(props) {
  // In Next.js 15, params may be wrapped in a promise
  const resolvedParams = await Promise.resolve(props.params);
  const slug = resolvedParams.slug;
  
  try {
    const post = await getPostData(slug);
    const serializedPost = serializePost(post);
    
    const formattedDate = new Date(serializedPost.date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return (
      <div className={styles.container}>
        <article className={styles.article}>
          <header className={styles.header}>
            <h1 className={styles.title}>{serializedPost.title}</h1>
            <div className={styles.meta}>
              <span className={styles.author}>{serializedPost.author}</span>
              <time dateTime={serializedPost.date} className={styles.date}>
                {formattedDate}
              </time>
            </div>
          </header>

          <PostContent post={serializedPost} />
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