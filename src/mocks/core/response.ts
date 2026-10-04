const MOCK_LATENCY_MS = 350;

export const snapshot = <T>(value: T): T => structuredClone(value);

export const simulateLatency = () =>
  new Promise<void>((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
