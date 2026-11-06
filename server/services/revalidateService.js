async function triggerRevalidation(paths = []) {
  const clientUrl = process.env.CLIENT_URL;
  const secret = process.env.REVALIDATION_SECRET;

  if (!clientUrl || !secret || paths.length === 0) {
    return;
  }

  try {
    await Promise.all(
      paths.map((path) =>
        fetch(`${clientUrl.replace(/\/$/, '')}/api/revalidate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-revalidate-secret': secret,
          },
          body: JSON.stringify({ path }),
          signal: AbortSignal.timeout(4000),
        }).catch(() => null)
      )
    );
  } catch {
    // Non-blocking on-demand ISR trigger
  }
}

module.exports = { triggerRevalidation };
