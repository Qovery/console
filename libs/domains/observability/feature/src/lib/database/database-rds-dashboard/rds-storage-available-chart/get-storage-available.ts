const BYTES_PER_GIB = 1024 * 1024 * 1024

/** CloudWatch reports free bytes; use GiB when a blueprint does not expose total capacity. */
export function getStorageAvailable(freeBytes: string, storageCapacityGiB?: number): number | undefined {
  const freeGiB = Number(freeBytes) / BYTES_PER_GIB
  if (!Number.isFinite(freeGiB)) return undefined

  const available =
    storageCapacityGiB !== undefined && Number.isFinite(storageCapacityGiB) && storageCapacityGiB > 0
      ? (freeGiB / storageCapacityGiB) * 100
      : freeGiB
  return Number.isFinite(available) ? available : undefined
}
