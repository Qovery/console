const BYTES_PER_GIB = 1024 * 1024 * 1024

/** CloudWatch reports free bytes; use GiB when a blueprint does not expose total capacity. */
export function getStorageAvailable(freeBytes: string, storageCapacityGiB?: number): number {
  const freeGiB = Number.parseFloat(freeBytes) / BYTES_PER_GIB
  return storageCapacityGiB !== undefined && storageCapacityGiB > 0 ? (freeGiB / storageCapacityGiB) * 100 : freeGiB
}
