const queues = new Map();

export async function withLock(key, task) {
  const previous = queues.get(key) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });
  const next = previous.then(() => current);
  queues.set(key, next);

  await previous.catch(() => {});

  try {
    return await task();
  } finally {
    release();
    if (queues.get(key) === next) {
      queues.delete(key);
    }
  }
}
