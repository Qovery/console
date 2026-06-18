import { formatCloudProvider } from './format-cloud-provider'

describe('formatCloudProvider', () => {
  it.each([
    ['aws', 'AWS'],
    ['AWS', 'AWS'],
    ['scw', 'Scaleway'],
    ['SCW', 'Scaleway'],
    ['gcp', 'GCP'],
    ['GCP', 'GCP'],
    ['azure', 'Azure'],
    ['AZURE', 'Azure'],
    ['ovh_cloud', 'OVH_CLOUD'],
  ])('should format %s as %s', (provider, expected) => {
    expect(formatCloudProvider(provider)).toBe(expected)
  })
})
