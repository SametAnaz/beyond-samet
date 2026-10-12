'use client';
export default function BlogError({ reset }) {
  return <section className="page-message" role="alert"><h1>Yazılar şu anda yüklenemiyor</h1><p>Bağlantıda bir sorun oluştu. Biraz sonra tekrar deneyebilirsiniz.</p><button onClick={reset}>Tekrar dene</button></section>;
}
