import { match } from 'ts-pattern'

export function formatCloudProvider(provider: string) {
  const normalizedProvider = provider.toLowerCase()

  return match(normalizedProvider)
    .with('aws', () => 'AWS')
    .with('scw', () => 'Scaleway')
    .with('gcp', () => 'GCP')
    .with('azure', () => 'Azure')
    .otherwise(() => provider.toUpperCase())
}
