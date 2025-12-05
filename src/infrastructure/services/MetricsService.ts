import { IMetrics } from '../../domain/services/IMetrics';

export class MetricsService implements IMetrics {
  private counters: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private gauges: Map<string, number> = new Map();

  increment(counter: string, value: number = 1): void {
    const current = this.counters.get(counter) || 0;
    this.counters.set(counter, current + value);
    console.log(`[METRICS] Counter ${counter}: ${current + value}`);
  }

  decrement(counter: string, value: number = 1): void {
    const current = this.counters.get(counter) || 0;
    const next = Math.max(0, current - value);
    this.counters.set(counter, next);
    console.log(`[METRICS] Counter ${counter} decremented: ${next}`);
  }

  histogram(name: string, value: number): void {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, []);
    }
    this.histograms.get(name)!.push(value);
    console.log(`[METRICS] Histogram ${name}: ${value}`);
  }

  gauge(name: string, value: number): void {
    this.gauges.set(name, value);
    console.log(`[METRICS] Gauge ${name}: ${value}`);
  }

  timing(name: string, duration: number): void {
    this.histogram(name, duration);
  }

  // Utility methods for testing/debugging
  getCounter(counter: string): number {
    return this.counters.get(counter) || 0;
  }

  getHistogram(name: string): number[] {
    return this.histograms.get(name) || [];
  }

  getGauge(name: string): number {
    return this.gauges.get(name) || 0;
  }
}
