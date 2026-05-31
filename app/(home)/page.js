import { getAllPosts } from '@/lib/mysql-posts';
import HomeClientWrapper from './HomeClientWrapper';

export const revalidate = 300; // Her 5 dakikada verileri yeniden çek

async function getLatestPosts() {
  try {
    const result = await getAllPosts();
    if (!result.success) {
      throw new Error(result.error);
    }
    
    // Son 3 yayınlanmış postu al
    const publishedPosts = result.posts
      .filter(post => post.published === 1)
      .slice(0, 3);
      
    return publishedPosts;
  } catch (error) {
    console.error('Error fetching latest posts:', error);
    return [];
  }
}

export default async function Home() {
  const posts = await getLatestPosts();

  return <HomeClientWrapper posts={posts} />;
}
