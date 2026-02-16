export function deleteEntry(
  key: string,
  setKeys: (keys: string[]) => void,
  keys: string[],
  unregister: (name: string | string[]) => void
): void {
  const newKeys = keys.filter((el) => el !== key)
  setKeys(newKeys)
  unregister(key + '_key')
  unregister(key + '_value')
  unregister(key + '_secret')
  unregister(key + '_scope')
}
