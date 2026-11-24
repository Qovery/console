import { getSelfManagedClusterRegistryRequest, validateRegistryUrl } from './self-managed-cluster-registry'

describe('validateRegistryUrl', () => {
  it.each([
    'https://registry.example.com',
    'http://registry.example.com',
    'https://registry.example.com:5000',
    'https://10.0.0.12:5000',
    'https://[2001:db8::2]:5000',
    '  https://registry.example.com  ',
    'https://mirror.ghcr.io',
    'https://docker.io.example.com',
    'https://registry.example.com.',
    'https://registry-1.example.com:65535',
    'https://128.0.0.1',
    'https://registry:5000',
  ])('accepts %s', (url) => {
    expect(validateRegistryUrl(url)).toBe(true)
  })

  it.each([
    'https://docker.io',
    'https://ghcr.io',
    'https://registry.gitlab.com',
    'https://public.ecr.aws',
    'https://docker.io:443',
    'https://GHCR.io',
    'https://docker.io.',
    'https://GHCR.IO.:443',
  ])('rejects %s, which is not a generic registry', (url) => {
    expect(validateRegistryUrl(url)).toBe(
      'Use the DOCKER_HUB or GITHUB_CR type for Docker Hub or GitHub. GitLab and Amazon ECR Public registries cannot be used here.'
    )
  })

  it.each([
    ['', 'Please enter a registry URL.'],
    ['   ', 'Please enter a registry URL.'],
    ['registry.example.com', 'The registry URL must start with http:// or https://.'],
    ['registry.example.com:5000', 'The registry URL must start with http:// or https://.'],
    ['ftp://registry.example.com', 'The registry URL must start with http:// or https://.'],
    ['HTTPS://registry.example.com', 'The registry URL must start with http:// or https://.'],
    ['https://user@registry.example.com', 'The registry URL must not contain a username or a password.'],
    ['https://user:secret@registry.example.com', 'The registry URL must not contain a username or a password.'],
    ['https://', 'Please enter a valid registry URL, for example https://registry.example.com:5000.'],
    [
      'https://registry example.com',
      'Please enter a valid registry URL, for example https://registry.example.com:5000.',
    ],
    [
      'https://registry.example.com:port',
      'Please enter a valid registry URL, for example https://registry.example.com:5000.',
    ],
    ...[
      'https://-registry.example.com',
      'https://registry-.example.com',
      'https://registry..example.com',
      'https://registry.example.com..',
      'https://registry.123',
      'https://127.1',
      'https://256.0.0.1',
      `https://${'a'.repeat(64)}.example.com`,
      'https://registry.example.com:0',
      'https://registry.example.com:65536',
      'https://registry.example.com:999999',
    ].map((url) => [url, 'Please enter a valid registry URL, for example https://registry.example.com:5000.']),
    ['https://localhost', 'The registry URL cannot target localhost.'],
    ['https://mylocalhost.example.com', 'The registry URL cannot target localhost.'],
    ['https://127.0.0.2', 'The registry URL cannot target localhost.'],
    ['https://127.255.255.254:5000', 'The registry URL cannot target localhost.'],
    ['https://0.0.0.0', 'The registry URL cannot target localhost.'],
    ['https://[::]:5000', 'The registry URL cannot target localhost.'],
    ['http://localhost:5000', 'The registry URL cannot target localhost.'],
    ['https://127.0.0.1:5000', 'The registry URL cannot target localhost.'],
    ['https://[::1]:5000', 'The registry URL cannot target localhost.'],
    [
      'https://registry.example.com/',
      'The registry URL must not contain a path: keep the host and the optional port only.',
    ],
    [
      'https://registry.example.com/v2/my-project',
      'The registry URL must not contain a path: keep the host and the optional port only.',
    ],
    ['https://registry.example.com?mirror=true', 'The registry URL must not contain query parameters.'],
    ['https://registry.example.com#images', 'The registry URL must not contain a fragment.'],
  ])('rejects "%s"', (url, message) => {
    expect(validateRegistryUrl(url)).toBe(message)
  })
})

describe('getSelfManagedClusterRegistryRequest', () => {
  it('sends a generic registry without credentials for an anonymous login', () => {
    expect(
      getSelfManagedClusterRegistryRequest({
        kind: 'GENERIC_CR',
        url: ' https://registry.example.com:5000 ',
        config: { login_type: 'ANONYMOUS' },
      })
    ).toStrictEqual({ kind: 'GENERIC_CR', url: 'https://registry.example.com:5000' })
  })

  it('sends the credentials of a generic registry with an account login', () => {
    expect(
      getSelfManagedClusterRegistryRequest({
        kind: 'GENERIC_CR',
        url: 'https://registry.example.com',
        config: { login_type: 'ACCOUNT', username: ' robot ', password: 's3cret' },
      })
    ).toStrictEqual({
      kind: 'GENERIC_CR',
      url: 'https://registry.example.com',
      credentials: { username: 'robot', password: 's3cret' },
    })
  })

  it('ignores credentials left over from an account login switched to anonymous', () => {
    expect(
      getSelfManagedClusterRegistryRequest({
        kind: 'GENERIC_CR',
        url: 'https://registry.example.com',
        config: { login_type: 'ANONYMOUS', username: 'robot', password: 's3cret' },
      })
    ).toStrictEqual({ kind: 'GENERIC_CR', url: 'https://registry.example.com' })
  })

  it.each(['GITHUB_CR', 'DOCKER_HUB'] as const)(
    'sends the credentials of a %s registry whatever the stored login type, and no empty URL',
    (kind) => {
      expect(
        getSelfManagedClusterRegistryRequest({
          kind,
          url: '',
          config: { login_type: 'ANONYMOUS', username: 'qovery', password: 's3cret' },
        })
      ).toStrictEqual({ kind, credentials: { username: 'qovery', password: 's3cret' } })
    }
  )

  it.each([
    ['   ', 's3cret'],
    ['robot', '   '],
  ])('never sends a blank username or password (%j, %j)', (username, password) => {
    expect(
      getSelfManagedClusterRegistryRequest({
        kind: 'GENERIC_CR',
        url: 'https://registry.example.com',
        config: { login_type: 'ACCOUNT', username, password },
      })
    ).toStrictEqual({ kind: 'GENERIC_CR', url: 'https://registry.example.com' })
  })
})
