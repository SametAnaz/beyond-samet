'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }) {
  const [status, setStatus] = useState('loading');
  const router = useRouter();
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/session', { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (response.status === 401) { router.replace('/admin/login'); return; }
        if (!response.ok) throw new Error('Oturum kontrolü başarısız');
        setStatus('authenticated');
      })
      .catch(error => { if (error.name !== 'AbortError') setStatus('error'); });
    return () => controller.abort();
  }, [router]);
  const logout = async () => {
    const response = await fetch('/api/admin/logout', { method: 'POST' });
    if (!response.ok) { setStatus('error'); return; }
    localStorage.removeItem('adminAuth');
    router.replace('/admin/login');
    router.refresh();
  };
  if (status === 'error') return <p role="alert">Oturum kontrol edilemedi. Lütfen sayfayı yenileyin.</p>;
  if (status !== 'authenticated') return <p role="status">Oturum kontrol ediliyor…</p>;
  return <div className="admin-container"><div className="admin-header"><button onClick={logout} className="admin-btn btn-secondary">Çıkış Yap</button></div>{children}</div>;
}
