import { NextResponse } from 'next/server';
import { remark } from 'remark';
import html from 'remark-html';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';

export async function POST(request) {
  try {
    const { markdown } = await request.json();

    if (!markdown) {
      return NextResponse.json(
        { error: 'Markdown content is required' },
        { status: 400 }
      );
    }

    console.log('Markdown işleme başladı');
    
    // İlk olarak görselleri işlemek için özel bir dönüşüm fonksiyonu
    // bu regex görselleri ![alt](src) formatında arar
    const processedMarkdown = markdown.replace(
      /!\[(.*?)\]\((.*?)\)(?:{(.*?)})?/g,
      (match, alt, src, attributes) => {
        // Eğer src zaten OptimizedImage bileşenini kullanıyorsa dokunma
        if (src.includes('<OptimizedImage')) {
          return match;
        }

        // Özellikler varsa bunları parse et
        let width = 800;
        let height = 450;
        
        if (attributes) {
          const widthMatch = attributes.match(/width=(\d+)/);
          const heightMatch = attributes.match(/height=(\d+)/);
          
          if (widthMatch) width = parseInt(widthMatch[1], 10);
          if (heightMatch) height = parseInt(heightMatch[1], 10);
        }

        // OptimizedImage JSX'ini HTML string olarak oluştur
        return `<div data-optimized-image="true" data-src="${src}" data-alt="${alt || ''}" data-width="${width}" data-height="${height}"></div>`;
      }
    );

    // Markdown'ı HTML'e dönüştür
    const processedContent = await unified()
      .use(remarkGfm)
      .use(remark)
      .use(html, { sanitize: false })
      .use(rehypeRaw)
      .use(rehypeHighlight)
      .process(processedMarkdown);
    
    let contentHtml = processedContent.toString();
    
    console.log('Markdown başarıyla HTML\'e dönüştürüldü');
    
    return NextResponse.json({ html: contentHtml });
  } catch (error) {
    console.error('Markdown işleme hatası:', error);
    return NextResponse.json(
      { error: `Markdown işleme hatası: ${error.message}` },
      { status: 500 }
    );
  }
} 