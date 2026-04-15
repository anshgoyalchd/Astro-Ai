const buckets = new Map();

function pruneBucket(key, now) {
  const bucket = buckets.get(key);
  if (!bucket) return [];

  const validHits = bucket.hits.filter((timestamp) => timestamp > now - bucket.windowMs);
  if (validHits.length === 0) {
    buckets.delete(key);
    return [];
  }

  bucket.hits = validHits;
  return validHits;
}

export function checkRateLimit({ key, maxHits, windowMs }) {
  const now = Date.now();
  const existingHits = pruneBucket(key, now);

  if (existingHits.length >= maxHits) {
    const retryAfterMs = existingHits[0] + windowMs - now;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000))
    };
  }

  buckets.set(key, {
    windowMs,
    hits: [...existingHits, now]
  });

  return { allowed: true, retryAfterSeconds: 0 };
}

export function rateLimitResponse(res, retryAfterSeconds, message) {
  res.set('Retry-After', String(retryAfterSeconds));
  return res.status(429).json({ message });
}
