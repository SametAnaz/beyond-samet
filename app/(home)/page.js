import { listPosts } from '@/lib/posts-query';
import HomeClientWrapper from './HomeClientWrapper';
import ProjectCards from '@/components/ProjectCards';
export const dynamic = 'force-dynamic';
export const metadata = { alternates: { canonical: '/' } };
export default async function Home() {
  const { posts } = await listPosts({ limit: 3 });
  return <HomeClientWrapper posts={posts} projects={<ProjectCards />} />;
}
