'use client';
export default function GalleryError({ reset }) {
  return <section className="page-message" role="alert"><h1>Galeri yüklenemedi</h1><p>Görselleri şu anda getiremiyoruz.</p><button onClick={reset}>Tekrar dene</button></section>;
}
