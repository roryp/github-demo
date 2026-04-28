import type { Request, Response, NextFunction, RequestHandler } from 'express';

export interface RateLimitMetrics {
  allowed: number;
  throttled: number;
}

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface ClientEntry {
  count: number;
  resetTime: number;
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  windowMs: 60_000,
  maxRequests: 100,
};

/**
 * Creates a rate-limiting middleware that tracks requests per IP.
 * Returns 429 with Retry-After header when the limit is exceeded.
 */
export function createRateLimiter(
  options: Partial<RateLimitOptions> = {},
): RequestHandler & { metrics: RateLimitMetrics; reset: () => void } {
  const { windowMs, maxRequests } = { ...DEFAULT_OPTIONS, ...options };
  const clients = new Map<string, ClientEntry>();
  const metrics: RateLimitMetrics = { allowed: 0, throttled: 0 };

  function getClientKey(req: Request): string {
    return req.ip ?? req.socket.remoteAddress ?? 'unknown';
  }

  const middleware = ((req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = getClientKey(req);
    let entry = clients.get(key);

    if (!entry || now >= entry.resetTime) {
      entry = { count: 0, resetTime: now + windowMs };
      clients.set(key, entry);
    }

    entry.count++;

    // Set rate limit headers on every response
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

    if (entry.count > maxRequests) {
      metrics.throttled++;
      const retryAfterSec = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({ error: 'Too Many Requests' });
    }

    metrics.allowed++;
    next();
  }) as RequestHandler & { metrics: RateLimitMetrics; reset: () => void };

  middleware.metrics = metrics;
  middleware.reset = () => {
    clients.clear();
    metrics.allowed = 0;
    metrics.throttled = 0;
  };

  return middleware;
}
