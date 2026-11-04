import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '@/services/api/client';

const QUEUE_KEY = 'rachas.analytics.queue';
const CONSENT_KEY = 'rachas.analytics.consent';
const FLUSH_SIZE = 20;

type QueuedEvent = {
  nombre: string;
  propiedades?: Record<string, string | number | boolean>;
  ocurrioEn: string;
};

export async function getAnalyticsConsent(): Promise<boolean> {
  const value = await AsyncStorage.getItem(CONSENT_KEY);
  return value !== 'false';
}

export async function setAnalyticsConsent(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(CONSENT_KEY, enabled ? 'true' : 'false');
}

async function readQueue(): Promise<QueuedEvent[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as QueuedEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeQueue(events: QueuedEvent[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(events));
}

export async function flushAnalyticsQueue(): Promise<void> {
  const queue = await readQueue();
  if (queue.length === 0) {
    return;
  }
  const batch = queue.slice(0, FLUSH_SIZE);
  await apiRequest('/analytics/events', {
    method: 'POST',
    body: { eventos: batch },
    auth: true,
  });
  await writeQueue(queue.slice(batch.length));
}

export async function track(
  nombre: string,
  propiedades?: Record<string, string | number | boolean>,
): Promise<void> {
  const consent = await getAnalyticsConsent();
  if (!consent) {
    return;
  }
  const queue = await readQueue();
  queue.push({
    nombre,
    propiedades,
    ocurrioEn: new Date().toISOString(),
  });
  await writeQueue(queue);
  if (queue.length >= FLUSH_SIZE) {
    await flushAnalyticsQueue().catch(() => undefined);
  }
}
