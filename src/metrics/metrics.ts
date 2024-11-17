import client from 'prom-client';

const register = new client.Registry();

const importDuration = new client.Histogram({
  name: 'deck_import_duration_seconds',
  help: 'Duração da importação de decks em segundos',
  labelNames: ['success'],
});

const importCounter = new client.Counter({
  name: 'deck_import_total',
  help: 'Número total de importações de decks',
  labelNames: ['status'],
});

register.registerMetric(importDuration);
register.registerMetric(importCounter);
register.setDefaultLabels({ app: 'mtg-api' });
client.collectDefaultMetrics({ register });

export function recordImportDuration(success: boolean, duration: number) {
  importDuration.labels(success.toString()).observe(duration);
}

export function incrementImportCount(status: string) {
  importCounter.labels(status).inc();
}

export { register };
