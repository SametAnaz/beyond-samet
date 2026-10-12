import { ImageResponse } from 'next/og';
import { getPublishedPost } from '@/lib/posts-query';
export const alt = 'Beyond Samet blog yazısı';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default async function OpenGraphImage({ params }) {
  const { slug } = await params; const post = await getPublishedPost(slug);
  return new ImageResponse(<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', background: '#0c1725', color: '#f4f8ff', padding: '72px' }}><div style={{ display: 'flex', fontSize: 28, color: '#74d5c6' }}>BEYOND SAMET · BLOG</div><div style={{ display: 'flex', fontSize: 60, fontWeight: 700, lineHeight: 1.15 }}>{(post?.title || 'Beyond Samet').slice(0, 160)}</div><div style={{ display: 'flex', fontSize: 26 }}>{post?.author || 'Samet Anaz'}</div></div>, size);
}
