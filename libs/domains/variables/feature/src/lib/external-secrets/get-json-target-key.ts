export function getJsonTargetKey(secret: { isJson?: boolean; isFile?: boolean; keyName?: string }): string | null {
  if (!secret.isJson) return null
  if (secret.isFile) throw new Error('JSON selection is only supported for environment variables.')
  const keyName = secret.keyName?.trim()
  if (!keyName) throw new Error('Please enter a JSON property path.')
  return keyName
}
