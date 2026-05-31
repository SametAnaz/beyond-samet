import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

export async function POST(request) {
  const authResponse = requireAdminAuth(request);
  if (authResponse) return authResponse;

  try {
    const { markdown } = await request.json();

    if (!markdown || typeof markdown !== 'string') {
      return NextResponse.json(
        { error: 'Markdown content is required' },
        { status: 400 }
      );
    }

    if (markdown.length > 100_000) {
      return NextResponse.json(
        { error: 'Markdown content is too large' },
        { status: 413 }
      );
    }

    const processedContent = await remark()
      .use(remarkGfm)
      .use(html, { sanitize: true })
      .process(markdown);
    
    return NextResponse.json({ html: processedContent.toString() });
  } catch (error) {
    console.error('Markdown işleme hatası:', error);
    return NextResponse.json(
      { error: 'Markdown işleme hatası' },
      { status: 500 }
    );
  }
}
