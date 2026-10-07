// One project-wide daily allowance of R2-operation admission units.
// Control reads, status reads, and the quota store's own operations are separate.
export async function reserveWorkUnits(env, units, now = new Date()) {
  const limit = Number(env.DAILY_WORK_UNITS);
  if (!Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(units) || units < 1) {
    return false;
  }
  const day = now.toISOString().slice(0, 10); // UTC work window, not invoice period.
  const key = `${env.PROJECT_ID}:work-units:${day}`;
  const raw = await env.QUOTA.get(key);
  const used = raw === null ? 0 : Number(raw);
  if (!Number.isSafeInteger(used) || used < 0 || used + units > limit) return false;
  await env.QUOTA.put(key, String(used + units), { expirationTtl: 172800 });
  return true;
}
