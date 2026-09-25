export function getAwsLocationFlagCode(location: string): 'EU' | 'US' | undefined {
  if (/^eu[.-]/.test(location)) return 'EU'
  if (/^us[.-]/.test(location)) return 'US'
  return undefined
}
