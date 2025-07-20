import { getPostBySlug, getAllPosts } from '@/lib/mysql-posts';
import styles from '../../../styles/blog/post.module.css';
import CommentSection from '../components/CommentSection';
import PostContent from '../components/PostContent';

export const revalidate = 300; // Her 5 dakikada verileri yeniden çek

// MySQL'den direkt post verisi çek
async function getPostWithComments(slug) {
  try {
    const result = await getPostBySlug(slug);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
}

// Post'ların slug'larını çek (static generation için)
async function getAllPostSlugs() {
  try {
    const result = await getAllPosts();
    if (!result.success) {
      return [];
    }
    
    // Sadece yayınlanmış postları döndür
    const publishedPosts = result.posts.filter(post => post.published === 1);
    return publishedPosts.map(post => ({ slug: post.slug }));
  } catch (error) {
    console.error('Error fetching post slugs:', error);
    return [];
  }
}

export async function generateStaticParams() {
  const paths = await getAllPostSlugs();
  return paths;
}

export async function generateMetadata({ params }) {
  // In Next.js 15, params may be wrapped in a promise
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  
  try {
    const { post } = await getPostWithComments(slug);
    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: 'article',
        authors: [post.author],
        publishedTime: new Date(post.createdAt).toISOString(),
      },
    };
  } catch (error) {
    return {
      title: 'Blog Yazısı Bulunamadı',
      description: 'Aradığınız blog yazısı bulunamadı veya kaldırılmış olabilir.'
    };
  }
}

// Serialize MySQL data to ensure it's safe to pass to client components
function serializePost(post) {
  return {
    slug: post.slug,
    title: post.title,
    author: post.author,
    content: post.content || '',
    contentHtml: post.contentHtml || '',
    excerpt: post.excerpt || '',
    // Convert date objects to ISO strings
    date: new Date(post.createdAt).toISOString(),
    // Convert updatedAt to ISO string if it exists
    updatedAt: post.updatedAt ? 
               new Date(post.updatedAt).toISOString() : 
               new Date().toISOString()
  };
}

// Main blog post component (Server Component)
export default async function BlogPost(props) {
  // In Next.js 15, params may be wrapped in a promise
  const resolvedParams = await Promise.resolve(props.params);
  const slug = resolvedParams.slug;
  
  try {
    const { post, comments } = await getPostWithComments(slug);
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
        
        <CommentSection slug={slug} initialComments={comments} />
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