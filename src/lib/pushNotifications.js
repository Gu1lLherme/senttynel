// Web Push subscription helper.
// Quando o app for portado para React Native, troque este módulo por
// firebase/messaging mantendo a mesma API pública (subscribe / unsubscribe).

import { base44 } from '@/api/base44Client';

// VAPID public key — em produção, mover para variável pública.
// Esta chave é apenas o lado público (segura para o frontend).
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function getPermissionState() {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

export async function subscribeToPush() {
  if (!isPushSupported()) throw new Error('Push notifications não suportadas neste navegador.');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Permissão de notificação negada.');

  const reg = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const json = sub.toJSON();
  const me = await base44.auth.me();

  // De-dup: remover assinaturas anteriores deste mesmo endpoint
  const existing = await base44.entities.PushSubscription.filter({ endpoint: json.endpoint });
  for (const s of existing) {
    await base44.entities.PushSubscription.delete(s.id);
  }

  await base44.entities.PushSubscription.create({
    user_email: me.email,
    endpoint: json.endpoint,
    p256dh: json.keys?.p256dh,
    auth: json.keys?.auth,
    user_agent: navigator.userAgent,
    is_active: true,
  });

  return sub;
}

export async function unsubscribeFromPush() {
  if (!isPushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await sub.unsubscribe();
    const me = await base44.auth.me();
    const existing = await base44.entities.PushSubscription.filter({
      user_email: me.email,
      endpoint: sub.endpoint,
    });
    for (const s of existing) await base44.entities.PushSubscription.delete(s.id);
  }
}

// Mostra notificação local (fallback quando o servidor ainda não pode emitir push)
export async function showLocalNotification(title, body, options = {}) {
  if (!isPushSupported()) return;
  if (Notification.permission !== 'granted') return;
  const reg = await navigator.serviceWorker.getRegistration();
  if (reg) {
    reg.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      vibrate: [200, 100, 200],
      ...options,
    });
  }
}