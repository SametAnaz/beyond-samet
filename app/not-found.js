import Link from 'next/link';
export default function NotFound() {
  return <section className="page-message"><p>404</p><h1>Bu sayfa bulunamadı</h1><p>Adres değişmiş veya içerik kaldırılmış olabilir.</p><Link href="/blog">Blog yazılarına dön</Link></section>;
}
