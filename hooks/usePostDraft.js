'use client';
import { useEffect, useRef, useState } from 'react';
import { slugify } from '../lib/post-utils.js';

export default function usePostDraft(key, data, setData, { ready = true, postId, canSaveDraft = true } = {}) {
  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState('');
  const [revision, setRevision] = useState(0);
  const id = useRef(postId || null);
  const baseline = useRef('');
  const dirty = useRef(false);
  const pending = useRef(null);
  const timer = useRef(null);
  const sequence = useRef(0);
  const paused = useRef(false);
  const latest = useRef(data);
  latest.current = data;

  useEffect(() => {
    if (!ready) return;
    id.current = postId || null;
    baseline.current = JSON.stringify(data);
    try {
      const cached = JSON.parse(localStorage.getItem(key) || 'null');
      if (cached?.data && (cached.unsynced || (!postId && cached.id))) {
        setData(current => ({ ...current, ...cached.data }));
        id.current = postId || cached.id || null;
        if (!cached.unsynced) baseline.current = JSON.stringify(cached.data);
        setStatus(cached.unsynced ? 'Kaydedilmemiş değişiklikler geri yüklendi' : 'Son taslak geri yüklendi');
      }
    } catch { setStatus('Bu cihazdaki yedek okunamadı'); }
    setHydrated(true);
    // Her tuşta değil, sunucu verisi ilk geldiğinde başlangıç durumunu belirle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready, postId]);

  useEffect(() => {
    if (!hydrated) return;
    const run = ++sequence.current;
    dirty.current = JSON.stringify(data) !== baseline.current;
    if (!dirty.current) return;
    try { localStorage.setItem(key, JSON.stringify({ data, id: id.current, unsynced: true })); setStatus('Değişiklikler bu cihazda yedeklendi'); }
    catch { setStatus('Yerel yedek alınamadı; değişiklikleri kaydedin'); }
    if (paused.current || !canSaveDraft || !data.title.trim()) return;
    let cancelled = false;
    const timeout = setTimeout(async () => {
      if (pending.current) await pending.current;
      if (cancelled || paused.current || run !== sequence.current) return;
      const snapshot = latest.current;
      if (JSON.stringify(snapshot) === baseline.current) return;
      const payload = { ...snapshot, slug: snapshot.slug || slugify(snapshot.title), tags: String(snapshot.tags || '').split(',').map(tag => tag.trim()).filter(Boolean) };
      delete payload.published;
      if (!id.current) payload.published = false;
      setStatus('Taslak kaydediliyor…');
      pending.current = (async () => {
        try {
          const response = await fetch(id.current ? `/api/posts?id=${encodeURIComponent(id.current)}` : '/api/posts', { method: id.current ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Taslak kaydedilemedi');
          if (result.post?.id) id.current = result.post.id;
          baseline.current = JSON.stringify(snapshot);
          dirty.current = JSON.stringify(latest.current) !== baseline.current;
          try { localStorage.setItem(key, JSON.stringify({ data: latest.current, id: id.current, unsynced: dirty.current })); } catch { /* Sunucu kaydı başarılı; yerel depolama zorunlu değil. */ }
          setStatus(dirty.current ? 'Yeni değişiklikler bu cihazda yedeklendi' : 'Taslak kaydedildi');
        } catch (error) { setStatus(error.message || 'Taslak sunucuya kaydedilemedi; yerel yedek korunuyor'); }
      })().finally(() => { pending.current = null; });
      await pending.current;
    }, 2000);
    timer.current = timeout;
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [data, hydrated, key, canSaveDraft, revision]);

  useEffect(() => {
    const leave = event => { if (dirty.current) { event.preventDefault(); event.returnValue = ''; } };
    const navigate = event => {
      const anchor = event.target.closest?.('a[href]');
      if (!dirty.current || !anchor || anchor.target === '_blank' || event.ctrlKey || event.metaKey) return;
      const target = new URL(anchor.href, location.href);
      if (target.href === location.href || (target.pathname === location.pathname && target.hash)) return;
      if (!window.confirm('Kaydedilmemiş değişiklikler var. Sayfadan ayrılmak istiyor musunuz?')) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener('beforeunload', leave);
    document.addEventListener('click', navigate, true);
    return () => { window.removeEventListener('beforeunload', leave); document.removeEventListener('click', navigate, true); };
  }, []);

  return {
    status,
    async waitForSave() { paused.current = true; sequence.current++; clearTimeout(timer.current); if (pending.current) await pending.current; },
    getId: () => id.current,
    markSaved() { baseline.current = JSON.stringify(latest.current); dirty.current = false; try { localStorage.removeItem(key); } catch { /* Kayıt başarılı. */ } setStatus('Kaydedildi'); },
    resumeAutosave() { paused.current = false; setRevision(current => current + 1); },
  };
}
