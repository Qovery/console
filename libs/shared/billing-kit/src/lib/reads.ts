/*
 * One read for every component that wants the same data at once. The top bar and the billing page
 * both mount an <OfferHost>, and a proposal is read by the top bar and the billing page's card:
 * without sharing, each mount sends its own request. A read is shared per client while it is in
 * flight and for a few seconds after; `fresh` (a reload after an action) always reads again, and
 * an action that changes what the reads return forgets them (forgetReads).
 */
const cache = new WeakMap<object, Map<string, { at: number; value: Promise<unknown> }>>()

/** How long a finished read is reused, in milliseconds. */
export const SHARED_READ_MS = 3000

export function sharedRead<T>(
  client: object,
  key: string,
  read: () => Promise<T>,
  fresh = false,
  now = Date.now()
): Promise<T> {
  let reads = cache.get(client)
  if (!reads) cache.set(client, (reads = new Map()))
  const hit = reads.get(key)
  if (hit && !fresh && now - hit.at < SHARED_READ_MS) return hit.value as Promise<T>
  const value = read()
  const entry = { at: now, value }
  reads.set(key, entry)
  // A failed read is not kept: the next one tries again.
  value.catch(() => {
    if (reads?.get(key) === entry) reads.delete(key)
  })
  return value
}

/** Forgets the shared reads of a client (all, or those whose key starts with `prefix`): the next
 *  read asks pricing-api again. Called after an action that changes them. */
export function forgetReads(client: object, prefix = ''): void {
  const reads = cache.get(client)
  if (!reads) return
  for (const k of [...reads.keys()]) if (k.startsWith(prefix)) reads.delete(k)
}
