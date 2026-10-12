import test from 'node:test';
import assert from 'node:assert/strict';
import React, { useState } from 'react';
import { act, create } from 'react-test-renderer';
import usePostDraft from '../hooks/usePostDraft.js';

test('taslak kaydı ve yerel kurtarma', async t => {
  const original = Object.fromEntries(['window', 'document', 'localStorage', 'fetch', 'setTimeout', 'clearTimeout', 'IS_REACT_ACT_ENVIRONMENT'].map(key => [key, globalThis[key]]));
  const storage = new Map();
  const timers = new Map();
  let timerId = 0;
  const events = { addEventListener() {}, removeEventListener() {} };
  Object.assign(globalThis, {
    window: events, document: events, IS_REACT_ACT_ENVIRONMENT: true,
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    setTimeout: callback => { timers.set(++timerId, callback); return timerId; },
    clearTimeout: id => timers.delete(id),
  });
  t.after(() => { for (const [key, value] of Object.entries(original)) { if (value === undefined) delete globalThis[key]; else globalThis[key] = value; } });
  let editor;
  let renderer;
  const initial = { title: '', content: '', tags: '', slug: '' };
  function Harness({ options = {} }) {
    const [data, setData] = useState(initial);
    editor = { data, setData, ...usePostDraft('draft-test', data, setData, options) };
    return null;
  }
  async function mount(options) { await act(async () => { renderer = create(React.createElement(Harness, { options })); }); }
  async function unmount() { await act(async () => renderer.unmount()); storage.clear(); timers.clear(); }
  async function change(value) { await act(async () => editor.setData(current => ({ ...current, ...value }))); }
  async function flush() { const callbacks = [...timers.values()]; timers.clear(); await act(async () => { await Promise.all(callbacks.map(callback => callback())); }); }

  await t.test('yayındaki yazı otomatik olarak taslağa çevrilmez', async () => {
    let requests = 0;
    globalThis.fetch = async () => { requests++; };
    await mount({ postId: 'published-id', canSaveDraft: false });
    await change({ title: 'Düzenlenen yazı' });
    await flush();
    assert.equal(requests, 0);
    assert.equal(JSON.parse(storage.get('draft-test')).unsynced, true);
    await unmount();
  });
  await t.test('geri yüklenen taslak aynı ID ile güncellenir', async () => {
    storage.set('draft-test', JSON.stringify({ data: { ...initial, title: 'Önceki taslak' }, id: 'saved-id', unsynced: false }));
    const requests = [];
    globalThis.fetch = async (url, options) => { requests.push({ url, ...options }); return { ok: true, json: async () => ({ post: { id: 'saved-id' } }) }; };
    await mount();
    assert.equal(editor.data.title, 'Önceki taslak');
    await change({ content: 'Yeni içerik' });
    await flush();
    assert.equal(requests.length, 1);
    assert.equal(requests[0].method, 'PUT');
    assert.equal(requests[0].url, '/api/posts?id=saved-id');
    assert.equal(JSON.parse(storage.get('draft-test')).unsynced, false);
    await unmount();
  });
  await t.test('elle kayıt bekleyen otomatik kaydı iptal eder', async () => {
    let requests = 0;
    globalThis.fetch = async () => { requests++; };
    await mount();
    await change({ title: 'Taslak' });
    await act(async () => editor.waitForSave());
    await flush();
    assert.equal(requests, 0);
    assert.equal(editor.getId(), null);
    await unmount();
  });
  await t.test('istek sürerken yazılan değişiklikler aynı taslakta saklanır', async () => {
    let resolveRequest;
    const requests = [];
    globalThis.fetch = async (url, options) => {
      requests.push({ url, ...options });
      if (requests.length === 1) await new Promise(resolve => { resolveRequest = resolve; });
      return { ok: true, json: async () => ({ post: { id: 'new-id' } }) };
    };
    await mount();
    await change({ title: 'Taslak', content: 'İlk sürüm' });
    const callback = [...timers.values()][0]; timers.clear();
    let saving;
    await act(async () => { saving = callback(); });
    await change({ content: 'Son sürüm' });
    await act(async () => { resolveRequest(); await saving; });
    assert.equal(JSON.parse(storage.get('draft-test')).unsynced, true);
    await flush();
    assert.equal(requests.length, 2);
    assert.equal(requests[1].method, 'PUT');
    assert.equal(JSON.parse(requests[1].body).content, 'Son sürüm');
    assert.equal(JSON.parse(storage.get('draft-test')).unsynced, false);
    await unmount();
  });
  await t.test('sunucu hatasında yerel yedek korunur', async () => {
    globalThis.fetch = async () => ({ ok: false, json: async () => ({ error: 'Veritabanına ulaşılamıyor' }) });
    await mount();
    await change({ title: 'Korunacak taslak', content: 'Kaybolmasın' });
    await flush();
    assert.equal(JSON.parse(storage.get('draft-test')).data.content, 'Kaybolmasın');
    assert.equal(JSON.parse(storage.get('draft-test')).unsynced, true);
    assert.equal(editor.status, 'Veritabanına ulaşılamıyor');
    await unmount();
  });
});
