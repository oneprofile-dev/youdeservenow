interface TikTokPixel {
  (method: "track", event: string, properties?: Record<string, unknown>): void;
  (method: "page"): void;
  (method: "load", pixelId: string): void;
  (method: "identify", properties: Record<string, unknown>): void;
  methods: string[];
  setAndDefer: (t: unknown, e: string) => void;
  instance: (t: string) => TikTokPixel;
  load: (id: string, options?: Record<string, unknown>) => void;
  page: () => void;
  track: (event: string, properties?: Record<string, unknown>) => void;
  push: (args: unknown[]) => void;
  _i: Record<string, unknown>;
  _t: Record<string, unknown>;
  _o: Record<string, unknown>;
}

declare global {
  interface Window {
    ttq?: TikTokPixel;
  }
}

export {};
