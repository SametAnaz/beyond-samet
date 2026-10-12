'use client';
export default function ErrorPage({ reset }) {
  return <section className="page-message" role="alert"><h1>Sayfa şu anda yüklenemiyor</h1><p>Geçici bir sorun oluştu. Lütfen tekrar deneyin.</p><button onClick={reset}>Tekrar dene</button></section>;
}
